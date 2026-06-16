package com.halisaha.reservation;

import com.halisaha.common.AppConstants;

import com.halisaha.common.exception.InvalidReservationException;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.common.exception.SlotAlreadyBookedException;
import com.halisaha.common.exception.UnauthorizedException;
import com.halisaha.common.service.AppSettingsService;
import com.halisaha.equipment.EquipmentService;
import com.halisaha.equipment.entity.Equipment;
import com.halisaha.equipment.entity.EquipmentRental;
import com.halisaha.equipment.repository.EquipmentRentalRepository;
import com.halisaha.equipment.repository.EquipmentRepository;
import com.halisaha.field.entity.Field;
import com.halisaha.field.repository.FieldRepository;
import com.halisaha.notification.AdminAlertService;
import com.halisaha.notification.EmailService;
import com.halisaha.payment.PaymentService;
import com.halisaha.payment.PaymentMethod;
import com.halisaha.payment.ReservationPaymentStatus;
import com.halisaha.reservation.dto.CreateReservationRequest;
import com.halisaha.reservation.dto.ReservationResponse;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.repository.ReservationRepository;
import com.halisaha.reservation.repository.SlotHoldRepository;
import com.halisaha.user.entity.User;
import com.halisaha.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();


    private final ReservationRepository reservationRepository;
    private final SlotHoldRepository slotHoldRepository;
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final EquipmentRentalRepository equipmentRentalRepository;
    private final EquipmentService equipmentService;
    private final AdminAlertService adminAlertService;
    private final EmailService emailService;
    private final PaymentService paymentService;
    private final AppSettingsService appSettingsService;
    private final com.halisaha.coupon.CouponService couponService;

    @Transactional
    public ReservationResponse createReservation(CreateReservationRequest request, Long userId) {
        if (request.getPrivacyAccepted() == null || !request.getPrivacyAccepted()) {
            throw new InvalidReservationException("Datenschutzerklärung muss akzeptiert werden.");
        }

        Field field = fieldRepository.findById(request.getFieldId())
                .orElseThrow(() -> new ResourceNotFoundException("Platz nicht gefunden"));

        if (!field.getActive()) {
            throw new InvalidReservationException("Dieser Platz ist derzeit nicht verfügbar.");
        }

        if (request.getGameType() == null || request.getGameType().isBlank()) {
            throw new InvalidReservationException("Sportart (Game Type) muss angegeben werden.");
        }
        boolean sportSupported = Arrays.asList(field.getSupportedSports()).contains(request.getGameType());
        if (!sportSupported) {
            throw new InvalidReservationException("Die gewählte Sportart wird auf diesem Platz nicht unterstützt.");
        }

        boolean durationAllowed = Arrays.asList(field.getAllowedDurations())
                .contains(request.getDurationMinutes());
        if (!durationAllowed) {
            throw new InvalidReservationException(
                    "Dauer von " + request.getDurationMinutes() + " Minuten ist für diesen Platz nicht erlaubt.");
        }

        if (request.getStartTime().isBefore(ZonedDateTime.now(AppConstants.VIENNA))) {
            throw new InvalidReservationException("Startzeit muss in der Zukunft liegen.");
        }

        if (userId == null && (request.getGuestEmail() == null || request.getGuestEmail().isBlank())) {
            throw new InvalidReservationException("E-Mail-Adresse ist für Gastbuchungen erforderlich.");
        }
        String normalizedGuestEmail = userId == null
                ? request.getGuestEmail().toLowerCase().trim()
                : null;

        int maxDailyMinutes = 180;
        ZonedDateTime dayStart = request.getStartTime().toLocalDate().atStartOfDay(AppConstants.VIENNA);
        ZonedDateTime dayEnd = dayStart.plusDays(1);

        if (userId != null) {
            int bookedMinutes = reservationRepository.sumDurationByUserAndDate(userId, dayStart, dayEnd);
            if (bookedMinutes + request.getDurationMinutes() > maxDailyMinutes) {
                throw new InvalidReservationException(
                        "Tägliches Buchungslimit überschritten. Maximal " + maxDailyMinutes +
                                " Minuten pro Tag erlaubt. Bereits gebucht: " + bookedMinutes + " Minuten.");
            }
        } else {
            int bookedMinutes = reservationRepository.sumDurationByGuestEmailAndDate(
                    normalizedGuestEmail, dayStart, dayEnd);
            if (bookedMinutes + request.getDurationMinutes() > maxDailyMinutes) {
                throw new InvalidReservationException(
                        "Tägliches Buchungslimit überschritten. Maximal " + maxDailyMinutes +
                                " Minuten pro Tag erlaubt. Bereits gebucht: " + bookedMinutes + " Minuten.");
            }
        }

        ZonedDateTime endTime = request.getStartTime().plusMinutes(request.getDurationMinutes());

        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                request.getFieldId(), request.getStartTime(), endTime);
        if (!conflicts.isEmpty()) {
            throw new SlotAlreadyBookedException(
                    "Der gewählte Zeitraum überschneidet sich mit einer bestehenden Reservierung.");
        }

        BigDecimal equipmentTotal = BigDecimal.ZERO;
        List<EquipmentRentalRecord> rentalRecords = new ArrayList<>();

        if (request.getEquipmentRentals() != null) {
            for (var item : request.getEquipmentRentals()) {

                Equipment equipment = equipmentRepository.findById(item.getEquipmentId())
                        .orElseThrow(() -> new ResourceNotFoundException("Ausrüstung nicht gefunden"));

                if (!equipment.getRentable()) {
                    throw new InvalidReservationException(equipment.getName() + " ist nicht zur Vermietung verfügbar.");
                }

                equipmentService.validateStock(
                        item.getEquipmentId(), item.getSize(), item.getQuantity(),
                        request.getStartTime(), endTime);

                BigDecimal hours = BigDecimal.valueOf(request.getDurationMinutes()).divide(BigDecimal.valueOf(60), 2,
                        java.math.RoundingMode.HALF_UP);
                BigDecimal rentalPrice = equipment.getRentalPricePerHour()
                        .multiply(hours)
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                equipmentTotal = equipmentTotal.add(rentalPrice);

                rentalRecords
                        .add(new EquipmentRentalRecord(equipment, item.getQuantity(), item.getSize(), rentalPrice));
            }
        }

        BigDecimal durationHoursDec = BigDecimal.valueOf(request.getDurationMinutes()).divide(BigDecimal.valueOf(60), 2,
                java.math.RoundingMode.HALF_UP);

        BigDecimal hourlyRate = appSettingsService.getSportPrice(request.getGameType());

        LocalTime slotTime = request.getStartTime().toLocalTime();
        if (appSettingsService.isHappyHourActiveForSlot(slotTime)) {
            int discountPercent = appSettingsService.getHappyHourDiscount();
            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                    BigDecimal.valueOf(discountPercent).divide(BigDecimal.valueOf(100), 2,
                            java.math.RoundingMode.HALF_UP));
            hourlyRate = hourlyRate.multiply(discountMultiplier);
            log.info("Happy Hour discount {}% applied for slot at {}", discountPercent, slotTime);
        }

        BigDecimal fieldPrice = hourlyRate.multiply(durationHoursDec);
        BigDecimal totalPrice = fieldPrice.add(equipmentTotal);

        BigDecimal couponDiscount = BigDecimal.ZERO;
        String appliedCouponCode = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            couponService.assertCouponValid(request.getCouponCode(), totalPrice);
            couponDiscount = couponService.calculateDiscount(request.getCouponCode(), totalPrice);
            totalPrice = totalPrice.subtract(couponDiscount);
            appliedCouponCode = request.getCouponCode().trim().toUpperCase();
            log.info("Coupon '{}' applied: -€{} discount", appliedCouponCode, couponDiscount);
        }

        String confirmationCode = generateConfirmationCode(request.getGameType());

        Reservation reservation = Reservation.builder()
                .confirmationCode(confirmationCode)
                .field(field)
                .gameType(request.getGameType())
                .startTime(request.getStartTime())
                .endTime(endTime)
                .durationMinutes(request.getDurationMinutes())
                .totalPrice(totalPrice)
                .couponCode(appliedCouponCode)
                .discountAmount(couponDiscount)
                .status(ReservationStatus.CONFIRMED)
                .privacyAccepted(true)
                .privacyAcceptedAt(ZonedDateTime.now(AppConstants.VIENNA))
                .notificationConsent(request.getNotificationConsent() != null && request.getNotificationConsent())
                .build();

        if (request.getNotificationConsent() != null && request.getNotificationConsent()) {
            reservation.setNotificationConsentAt(ZonedDateTime.now(AppConstants.VIENNA));
        }

        if (request.getPaymentMethod() != null) {
            reservation.setPaymentMethod(request.getPaymentMethod());
            if (request.getPaymentMethod() == PaymentMethod.ON_SITE) {
                reservation.setPaymentStatus(ReservationPaymentStatus.ON_SITE);
                if (appliedCouponCode != null) {
                    couponService.incrementUsage(appliedCouponCode);
                }
            }
        }

        String manageToken = null;
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Benutzer nicht gefunden"));
            reservation.setUser(user);
        } else {
            if (request.getGuestName() == null || request.getGuestName().isBlank()) {
                throw new InvalidReservationException("Gastname ist erforderlich.");
            }
            reservation.setGuestName(request.getGuestName().trim());
            reservation.setGuestPhone(request.getGuestPhone());
            reservation.setGuestEmail(normalizedGuestEmail);
            manageToken = generateOpaqueToken();
            reservation.setManageTokenHash(hashManageToken(manageToken));
        }

        reservation = reservationRepository.save(reservation);

        final Long reservationId = reservation.getId();
        List<EquipmentRental> savedRentals = new ArrayList<>();
        for (var record : rentalRecords) {
            EquipmentRental rental = EquipmentRental.builder()
                    .reservationId(reservationId)
                    .equipment(record.equipment)
                    .quantity(record.quantity)
                    .size(record.size)
                    .rentalPrice(record.price)
                    .build();
            savedRentals.add(equipmentRentalRepository.save(rental));
        }

        if (request.getSessionId() != null && !request.getSessionId().isBlank()) {
            slotHoldRepository.deleteBySessionId(request.getSessionId());
        }

        log.info("Reservation created: {} for field {}", confirmationCode, field.getName());

        adminAlertService.notifyNewReservation(reservation);

        String email = reservation.getUser() != null ? reservation.getUser().getEmail() : reservation.getGuestEmail();
        String name = reservation.getUser() != null ? reservation.getUser().getName() : reservation.getGuestName();
        if (email != null && !email.isBlank()) {
            emailService.sendConfirmation(email, name, field.getName(),
                    reservation.getStartTime(), reservation.getEndTime(),
                    reservation.getDurationMinutes(), totalPrice,
                    confirmationCode, reservation.getId(), null, manageToken);
        }

        ReservationResponse response = toResponse(reservation, savedRentals);
        if (manageToken != null) {
            response.setManageToken(manageToken);
        }
        return response;
    }

    @Transactional(readOnly = true)
    public ReservationResponse getByConfirmationCode(String confirmationCode) {
        Reservation reservation = reservationRepository.findByConfirmationCode(confirmationCode)
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));

        List<EquipmentRental> rentals = equipmentRentalRepository.findByReservationId(reservation.getId());
        return toResponse(reservation, rentals);
    }

    /**
     * Public reservation lookup — strips PII unless caller proves ownership.
     */
    @Transactional(readOnly = true)
    public ReservationResponse getByConfirmationCodePublic(String confirmationCode,
            Long userId, String manageToken) {
        Reservation reservation = reservationRepository.findByConfirmationCode(confirmationCode)
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));

        List<EquipmentRental> rentals = equipmentRentalRepository.findByReservationId(reservation.getId());
        ReservationResponse response = toResponse(reservation, rentals);

        boolean isOwner = isOwner(reservation, userId, manageToken);

        if (!isOwner) {
            response.setCustomerPhone(null);
            response.setCustomerEmail(null);
            response.setCustomerName(maskName(response.getCustomerName()));
        }

        return response;
    }

    /** Mask a name: "Max Mustermann" → "M** M**" */
    private String maskName(String name) {
        if (name == null || name.isBlank())
            return name;
        String[] parts = name.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            if (i > 0)
                sb.append(' ');
            sb.append(parts[i].charAt(0)).append("**");
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getUserReservations(Long userId) {
        List<Reservation> reservations = reservationRepository.findByUserId(userId);
        return reservations.stream()
                .map(r -> {
                    List<EquipmentRental> rentals = equipmentRentalRepository.findByReservationId(r.getId());
                    return toResponse(r, rentals);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservationResponse cancelReservation(String confirmationCode,
            Long userId, String manageToken, boolean isAdmin) {
        Reservation reservation = reservationRepository.findByConfirmationCode(confirmationCode)
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new InvalidReservationException("Reservierung ist bereits storniert.");
        }

        String cancelledBy;
        if (isAdmin) {
            cancelledBy = "ADMIN";
        } else {
            validateOwnership(reservation, userId, manageToken);
            cancelledBy = "USER";
        }

        if (!isAdmin) {
            int deadlineHours = appSettingsService.getInt("cancellation_deadline_hours", 48);
            ZonedDateTime deadline = reservation.getStartTime().minusHours(deadlineHours);
            if (ZonedDateTime.now(AppConstants.VIENNA).isAfter(deadline)) {
                throw new InvalidReservationException(
                        "Stornierung ist nur bis " + deadlineHours + " Stunden vor Beginn möglich.");
            }
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancelledAt(ZonedDateTime.now(AppConstants.VIENNA));
        reservation.setCancelledBy(cancelledBy);
        reservationRepository.save(reservation);

        log.info("Reservation {} cancelled by {}", confirmationCode, cancelledBy);

        BigDecimal refundedAmount = BigDecimal.ZERO;
        if (reservation.getPaymentStatus() == ReservationPaymentStatus.PAID) {
            try {
                refundedAmount = paymentService.processRefund(reservation.getId());
                log.info("Auto-refund of {} EUR for reservation {}", refundedAmount, confirmationCode);
            } catch (Exception e) {
                log.error("Auto-refund failed for reservation {}. Manual refund required.", confirmationCode, e);
            }
        }

        String email = reservation.getUser() != null ? reservation.getUser().getEmail() : reservation.getGuestEmail();
        String name = reservation.getUser() != null ? reservation.getUser().getName() : reservation.getGuestName();
        if (email != null && !email.isBlank()) {
            emailService.sendCancellation(email, name, reservation.getField().getName(),
                    reservation.getStartTime(), confirmationCode, reservation.getId());
        }

        List<EquipmentRental> rentals = equipmentRentalRepository.findByReservationId(reservation.getId());
        return toResponse(reservation, rentals);
    }

    @Transactional
    public ReservationResponse modifyReservation(String confirmationCode,
            ZonedDateTime newStartTime,
            int newDurationMinutes,
            Long userId, String manageToken, boolean isAdmin) {
        Reservation reservation = reservationRepository.findByConfirmationCode(confirmationCode)
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new InvalidReservationException("Stornierte Reservierungen können nicht geändert werden.");
        }

        if (!isAdmin) {
            validateOwnership(reservation, userId, manageToken);
        }

        if (!isAdmin) {
            int deadlineHours = appSettingsService.getInt("cancellation_deadline_hours", 48);
            ZonedDateTime deadline = reservation.getStartTime().minusHours(deadlineHours);
            if (ZonedDateTime.now(AppConstants.VIENNA).isAfter(deadline)) {
                throw new InvalidReservationException(
                        "Änderungen sind nur bis " + deadlineHours + " Stunden vor Beginn möglich.");
            }
        }

        Field field = reservation.getField();
        boolean durationAllowed = Arrays.asList(field.getAllowedDurations()).contains(newDurationMinutes);
        if (!durationAllowed) {
            throw new InvalidReservationException(
                    "Dauer von " + newDurationMinutes + " Minuten ist für diesen Platz nicht erlaubt.");
        }

        ZonedDateTime newEndTime = newStartTime.plusMinutes(newDurationMinutes);

        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                field.getId(), newStartTime, newEndTime);
        conflicts.removeIf(r -> r.getId().equals(reservation.getId()));
        if (!conflicts.isEmpty()) {
            throw new SlotAlreadyBookedException(
                    "Der gewählte Zeitraum überschneidet sich mit einer bestehenden Reservierung.");
        }

        reservation.setStartTime(newStartTime);
        reservation.setEndTime(newEndTime);
        reservation.setDurationMinutes(newDurationMinutes);

        BigDecimal hours = BigDecimal.valueOf(newDurationMinutes).divide(BigDecimal.valueOf(60), 2,
                java.math.RoundingMode.HALF_UP);
        BigDecimal fieldPrice = appSettingsService.getSportPrice(reservation.getGameType()).multiply(hours);
        BigDecimal equipmentTotal = BigDecimal.ZERO;
        List<EquipmentRental> rentals = equipmentRentalRepository.findByReservationId(reservation.getId());
        for (EquipmentRental rental : rentals) {
            BigDecimal rentalPrice = rental.getEquipment().getRentalPricePerHour()
                    .multiply(hours)
                    .multiply(BigDecimal.valueOf(rental.getQuantity()));
            rental.setRentalPrice(rentalPrice);
            equipmentRentalRepository.save(rental);
            equipmentTotal = equipmentTotal.add(rentalPrice);
        }

        BigDecimal totalPrice = fieldPrice.add(equipmentTotal);

        if (reservation.getCouponCode() != null && !reservation.getCouponCode().isBlank()) {
            BigDecimal couponDiscount = couponService.calculateDiscount(reservation.getCouponCode(), totalPrice);
            totalPrice = totalPrice.subtract(couponDiscount);
            reservation.setDiscountAmount(couponDiscount);
        }

        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.MODIFIED);
        reservationRepository.save(reservation);

        log.info("Reservation {} modified", confirmationCode);

        return toResponse(reservation, rentals);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservationsByDateRange(LocalDate from, LocalDate to) {
        ZonedDateTime start = from.atStartOfDay(AppConstants.VIENNA);
        ZonedDateTime end = to.plusDays(1).atStartOfDay(AppConstants.VIENNA);
        List<Reservation> reservations = reservationRepository.findByDateRange(start, end);
        return reservations.stream()
                .map(r -> {
                    List<EquipmentRental> rentals = equipmentRentalRepository.findByReservationId(r.getId());
                    return toResponse(r, rentals);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getTodayReservations() {
        LocalDate today = LocalDate.now();
        return getReservationsByDateRange(today, today);
    }

    @Transactional(readOnly = true)
    public Page<ReservationResponse> getReservationsByStatus(ReservationStatus status, Pageable pageable) {
        return reservationRepository.findByStatus(status, pageable)
                .map(r -> {
                    List<EquipmentRental> rentals = equipmentRentalRepository.findByReservationId(r.getId());
                    return toResponse(r, rentals);
                });
    }

    @Transactional(readOnly = true)
    public ReservationResponse getById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));
        List<EquipmentRental> rentals = equipmentRentalRepository.findByReservationId(reservation.getId());
        return toResponse(reservation, rentals);
    }

    @Transactional
    public ReservationResponse adminModifyReservation(Long reservationId,
            ZonedDateTime newStartTime,
            int newDurationMinutes) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new InvalidReservationException("Stornierte Reservierungen können nicht geändert werden.");
        }

        Field field = reservation.getField();
        boolean durationAllowed = Arrays.asList(field.getAllowedDurations()).contains(newDurationMinutes);
        if (!durationAllowed) {
            throw new InvalidReservationException(
                    "Dauer von " + newDurationMinutes + " Minuten ist für diesen Platz nicht erlaubt.");
        }

        ZonedDateTime newEndTime = newStartTime.plusMinutes(newDurationMinutes);

        List<Reservation> conflicts = reservationRepository.findConflictingReservations(
                field.getId(), newStartTime, newEndTime);
        conflicts.removeIf(r -> r.getId().equals(reservation.getId()));
        if (!conflicts.isEmpty()) {
            throw new SlotAlreadyBookedException(
                    "Der gewählte Zeitraum überschneidet sich mit einer bestehenden Reservierung.");
        }

        reservation.setStartTime(newStartTime);
        reservation.setEndTime(newEndTime);
        reservation.setDurationMinutes(newDurationMinutes);

        BigDecimal hours = BigDecimal.valueOf(newDurationMinutes).divide(BigDecimal.valueOf(60), 2,
                java.math.RoundingMode.HALF_UP);
        BigDecimal fieldPrice = appSettingsService.getSportPrice(reservation.getGameType()).multiply(hours);

        List<EquipmentRental> rentals = equipmentRentalRepository.findByReservationId(reservation.getId());
        BigDecimal equipmentTotal = BigDecimal.ZERO;
        for (EquipmentRental rental : rentals) {
            BigDecimal rentalPrice = rental.getEquipment().getRentalPricePerHour()
                    .multiply(hours)
                    .multiply(BigDecimal.valueOf(rental.getQuantity()));
            rental.setRentalPrice(rentalPrice);
            equipmentRentalRepository.save(rental);
            equipmentTotal = equipmentTotal.add(rentalPrice);
        }

        BigDecimal totalPrice = fieldPrice.add(equipmentTotal);

        if (reservation.getCouponCode() != null && !reservation.getCouponCode().isBlank()) {
            BigDecimal couponDiscount = couponService.calculateDiscount(reservation.getCouponCode(), totalPrice);
            totalPrice = totalPrice.subtract(couponDiscount);
            reservation.setDiscountAmount(couponDiscount);
        }

        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.MODIFIED);
        reservationRepository.save(reservation);

        log.info("Reservation {} admin-modified", reservation.getConfirmationCode());

        return toResponse(reservation, rentals);
    }

    @Transactional
    public ReservationResponse adminCancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new InvalidReservationException("Reservierung ist bereits storniert.");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancelledAt(ZonedDateTime.now(AppConstants.VIENNA));
        reservation.setCancelledBy("ADMIN");
        reservationRepository.save(reservation);

        log.info("Reservation {} admin-cancelled", reservation.getConfirmationCode());

        if (reservation.getPaymentStatus() == ReservationPaymentStatus.PAID) {
            try {
                BigDecimal refunded = paymentService.processAdminRefund(
                        reservation.getId(), reservation.getTotalPrice());
                log.info("Admin auto-refund of {} EUR for reservation {}",
                        refunded, reservation.getConfirmationCode());
            } catch (Exception e) {
                log.error("Admin auto-refund failed for reservation {}. Manual refund required.",
                        reservation.getConfirmationCode(), e);
            }
        }

        String email = reservation.getUser() != null ? reservation.getUser().getEmail() : reservation.getGuestEmail();
        String name = reservation.getUser() != null ? reservation.getUser().getName() : reservation.getGuestName();
        if (email != null && !email.isBlank()) {
            emailService.sendCancellation(email, name, reservation.getField().getName(),
                    reservation.getStartTime(), reservation.getConfirmationCode(), reservation.getId());
        }

        List<EquipmentRental> rentals = equipmentRentalRepository.findByReservationId(reservation.getId());
        return toResponse(reservation, rentals);
    }

    private void validateOwnership(Reservation reservation, Long userId, String manageToken) {
        if (!isOwner(reservation, userId, manageToken)) {
            throw new UnauthorizedException("Sie sind nicht berechtigt, diese Reservierung zu aendern.");
        }
    }

    private boolean isOwner(Reservation reservation, Long userId, String manageToken) {
        if (reservation.getUser() != null) {
            return userId != null && userId.equals(reservation.getUser().getId());
        }
        if (manageToken == null || manageToken.isBlank() || reservation.getManageTokenHash() == null) {
            return false;
        }
        return java.security.MessageDigest.isEqual(
                hashManageToken(manageToken).getBytes(java.nio.charset.StandardCharsets.UTF_8),
                reservation.getManageTokenHash().getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private ReservationResponse toResponse(Reservation reservation, List<EquipmentRental> rentals) {
        String customerName;
        String customerPhone;
        String customerEmail;

        if (reservation.getUser() != null) {
            customerName = reservation.getUser().getName();
            customerPhone = reservation.getUser().getPhone();
            customerEmail = reservation.getUser().getEmail();
        } else {
            customerName = reservation.getGuestName();
            customerPhone = reservation.getGuestPhone();
            customerEmail = reservation.getGuestEmail();
        }

        List<ReservationResponse.RentalInfo> rentalInfos = rentals.stream()
                .map(r -> ReservationResponse.RentalInfo.builder()
                        .equipmentName(r.getEquipment().getName())
                        .quantity(r.getQuantity())
                        .size(r.getSize())
                        .price(r.getRentalPrice())
                        .build())
                .collect(Collectors.toList());

        return ReservationResponse.builder()
                .id(reservation.getId())
                .confirmationCode(reservation.getConfirmationCode())
                .fieldId(reservation.getField().getId())
                .fieldName(reservation.getField().getName())
                .fieldType(reservation.getGameType())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .startTime(reservation.getStartTime())
                .endTime(reservation.getEndTime())
                .durationMinutes(reservation.getDurationMinutes())
                .totalPrice(reservation.getTotalPrice())
                .status(reservation.getStatus())
                .paymentStatus(reservation.getPaymentStatus())
                .paymentMethod(reservation.getPaymentMethod())
                .couponCode(reservation.getCouponCode())
                .discountAmount(reservation.getDiscountAmount())
                .createdAt(reservation.getCreatedAt())
                .equipmentRentals(rentalInfos)
                .build();
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashManageToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private String generateConfirmationCode(String gameType) {
        String prefix = getSportPrefix(gameType);
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder(prefix);
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(ThreadLocalRandom.current().nextInt(chars.length())));
        }
        if (reservationRepository.findByConfirmationCode(sb.toString()).isPresent()) {
            return generateConfirmationCode(gameType);
        }
        return sb.toString();
    }

    /**
     * Maps a game type to a short prefix for confirmation codes.
     * FOOTBALL / Fußball → "FU-"
     * BUBBLE_SOCCER / Bubble Soccer → "BS-"
     * Any other sport → first 2 uppercase chars + "-"
     */
    private String getSportPrefix(String gameType) {
        if (gameType == null || gameType.isBlank()) {
            return "RES-";
        }
        String upper = gameType.trim().toUpperCase();
        return switch (upper) {
            case "FOOTBALL", "FUSSBALL", "FUßBALL" -> "FU-";
            case "BUBBLE", "BUBBLE_SOCCER", "BUBBLE SOCCER" -> "BS-";
            case "TENNIS" -> "TN-";
            case "BASKETBALL" -> "BK-";
            case "VOLLEYBALL" -> "VB-";
            default -> {
                String cleaned = upper.replaceAll("[^A-Z]", "");
                if (cleaned.length() >= 2) {
                    yield cleaned.substring(0, 2) + "-";
                }
                yield "RES-";
            }
        };
    }

    private record EquipmentRentalRecord(Equipment equipment, int quantity, String size, BigDecimal price) {
    }


    @Transactional(readOnly = true)
    public com.halisaha.reservation.dto.ReservationStatsResponse getReservationStats() {
        var now = ZonedDateTime.now(AppConstants.VIENNA);
        var monthStart = now.toLocalDate().withDayOfMonth(1).atStartOfDay(AppConstants.VIENNA);
        var monthEnd = monthStart.plusMonths(1);
        var prevMonthStart = monthStart.minusMonths(1);
        var prevMonthEnd = monthStart;
        var weekStart = now.toLocalDate().atStartOfDay(AppConstants.VIENNA)
                .minusDays(now.getDayOfWeek().getValue() - 1);
        var weekEnd = weekStart.plusDays(7);

        long totalThisMonth = reservationRepository.countAllByDateRange(monthStart, monthEnd);
        long totalPrevMonth = reservationRepository.countAllByDateRange(prevMonthStart, prevMonthEnd);
        double changePercent = totalPrevMonth > 0
                ? ((double) (totalThisMonth - totalPrevMonth) / totalPrevMonth) * 100
                : 0;

        long cancelledThisMonth = reservationRepository.countCancelledByDateRange(monthStart, monthEnd);
        double cancelRate = totalThisMonth > 0 ? (double) cancelledThisMonth / totalThisMonth * 100 : 0;
        long cancelledPrev = reservationRepository.countCancelledByDateRange(prevMonthStart, prevMonthEnd);
        double prevCancelRate = totalPrevMonth > 0 ? (double) cancelledPrev / totalPrevMonth * 100 : 0;

        String popularSlot = "18:00 - 20:00";
        List<Object[]> hourly = reservationRepository.getHourlyBookingDistribution(monthStart, monthEnd);
        if (!hourly.isEmpty()) {
            int topHour = ((Number) hourly.get(0)[0]).intValue();
            popularSlot = String.format("%02d:00 - %02d:00", topHour, topHour + 2);
        }

        BigDecimal monthRevenue = reservationRepository.sumRevenueByDateRange(monthStart, monthEnd);
        int dayOfMonth = now.getDayOfMonth();
        int daysInMonth = now.toLocalDate().lengthOfMonth();
        BigDecimal revenueProjection = dayOfMonth > 0
                ? monthRevenue.multiply(BigDecimal.valueOf(daysInMonth))
                        .divide(BigDecimal.valueOf(dayOfMonth), 0, java.math.RoundingMode.HALF_UP)
                : monthRevenue;
        BigDecimal prevRevenue = reservationRepository.sumRevenueByDateRange(prevMonthStart, prevMonthEnd);
        double revenueChangePercent = prevRevenue.compareTo(BigDecimal.ZERO) > 0
                ? revenueProjection.subtract(prevRevenue)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(prevRevenue, 1, java.math.RoundingMode.HALF_UP)
                        .doubleValue()
                : 0;

        List<Object[]> weeklyRaw = reservationRepository.getDailyBookingCounts(weekStart, weekEnd);
        String[] dayLabels = { "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So" };
        java.util.Map<String, Long> weekMap = new java.util.LinkedHashMap<>();
        for (String dl : dayLabels)
            weekMap.put(dl, 0L);
        for (Object[] row : weeklyRaw) {
            var d = ((java.sql.Date) row[0]).toLocalDate();
            int dow = d.getDayOfWeek().getValue() - 1;
            if (dow >= 0 && dow < 7) {
                weekMap.put(dayLabels[dow], weekMap.get(dayLabels[dow]) + ((Number) row[1]).longValue());
            }
        }
        List<com.halisaha.reservation.dto.ReservationStatsResponse.DailyBookingCount> weeklyBookings = new ArrayList<>();
        for (var entry : weekMap.entrySet()) {
            weeklyBookings.add(com.halisaha.reservation.dto.ReservationStatsResponse.DailyBookingCount.builder()
                    .label(entry.getKey()).count(entry.getValue()).build());
        }

        List<Object[]> monthlyRaw = reservationRepository.getDailyBookingCounts(monthStart, monthEnd);
        List<com.halisaha.reservation.dto.ReservationStatsResponse.DailyBookingCount> monthlyBookings = new ArrayList<>();
        for (Object[] row : monthlyRaw) {
            var d = ((java.sql.Date) row[0]).toLocalDate();
            monthlyBookings.add(com.halisaha.reservation.dto.ReservationStatsResponse.DailyBookingCount.builder()
                    .label(d.getDayOfMonth() + "." + d.getMonthValue() + ".")
                    .count(((Number) row[1]).longValue()).build());
        }

        var prevWeekStart = weekStart.minusDays(7);
        var prevWeekEnd = weekStart;
        List<Object[]> fieldMinutes = reservationRepository.getFieldBookedMinutes(weekStart, weekEnd);
        List<Object[]> prevFieldMinutes = reservationRepository.getFieldBookedMinutes(prevWeekStart, prevWeekEnd);

        java.util.Map<Long, Long> prevFieldMap = new java.util.HashMap<>();
        for (Object[] row : prevFieldMinutes) {
            prevFieldMap.put(((Number) row[0]).longValue(), ((Number) row[2]).longValue());
        }

        long totalAvailMinutesPerWeek = 7L * 14 * 60;

        List<com.halisaha.reservation.dto.ReservationStatsResponse.FieldUtilization> utilization = new ArrayList<>();
        List<Field> allFields = fieldRepository.findAll();
        java.util.Map<Long, Long> currentFieldMap = new java.util.HashMap<>();
        for (Object[] row : fieldMinutes) {
            currentFieldMap.put(((Number) row[0]).longValue(), ((Number) row[2]).longValue());
        }
        for (Field f : allFields) {
            if (!f.getActive())
                continue;
            long booked = currentFieldMap.getOrDefault(f.getId(), 0L);
            long prevBooked = prevFieldMap.getOrDefault(f.getId(), 0L);
            double pct = totalAvailMinutesPerWeek > 0 ? (double) booked / totalAvailMinutesPerWeek * 100 : 0;
            double prevPct = totalAvailMinutesPerWeek > 0 ? (double) prevBooked / totalAvailMinutesPerWeek * 100 : 0;
            utilization.add(com.halisaha.reservation.dto.ReservationStatsResponse.FieldUtilization.builder()
                    .fieldId(f.getId())
                    .fieldName(f.getName())
                    .bookedHours(booked / 60)
                    .totalHours(totalAvailMinutesPerWeek / 60)
                    .percent(Math.round(pct * 10.0) / 10.0)
                    .prevPercent(Math.round(prevPct * 10.0) / 10.0)
                    .build());
        }

        return com.halisaha.reservation.dto.ReservationStatsResponse.builder()
                .totalReservations(totalThisMonth)
                .prevMonthTotal(totalPrevMonth)
                .changePercent(Math.round(changePercent * 10.0) / 10.0)
                .cancelledCount(cancelledThisMonth)
                .cancelRate(Math.round(cancelRate * 10.0) / 10.0)
                .prevCancelRate(Math.round(prevCancelRate * 10.0) / 10.0)
                .popularTimeSlot(popularSlot)
                .monthRevenue(monthRevenue)
                .revenueProjection(revenueProjection)
                .revenueChangePercent(revenueChangePercent)
                .weeklyBookings(weeklyBookings)
                .monthlyBookings(monthlyBookings)
                .fieldUtilization(utilization)
                .build();
    }
}




