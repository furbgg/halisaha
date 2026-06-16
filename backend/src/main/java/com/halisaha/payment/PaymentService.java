package com.halisaha.payment;

import com.halisaha.common.AppConstants;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.common.service.AppSettingsService;
import com.halisaha.coupon.CouponService;
import com.halisaha.payment.dto.PaymentResponse;
import com.halisaha.payment.entity.Payment;
import com.halisaha.payment.repository.PaymentRepository;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.repository.ReservationRepository;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final StripeService stripeService;
    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final CouponService couponService;
    private final AppSettingsService appSettingsService;

    @Transactional
    public PaymentResponse initiatePayment(
            Long reservationId,
            Long userId,
            boolean isAdmin,
            String manageToken) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));

        validateReservationOwnership(reservation, userId, isAdmin, manageToken);

        if (reservation.getPaymentStatus() == ReservationPaymentStatus.PAID) {
            throw new IllegalStateException("Reservierung ist bereits bezahlt");
        }
        if (reservation.getPaymentStatus() == ReservationPaymentStatus.ON_SITE) {
            throw new IllegalStateException("Reservierung ist als Vor-Ort-Zahlung markiert");
        }
        if (reservation.getPaymentStatus() == ReservationPaymentStatus.PENDING
                && reservation.getStripePaymentIntentId() != null
                && !reservation.getStripePaymentIntentId().isBlank()) {
            throw new IllegalStateException("Fuer diese Reservierung laeuft bereits eine Zahlung");
        }
        var pendingPayment = paymentRepository.findByReservationIdAndStatus(
                reservationId, StripePaymentStatus.PENDING);
        if (pendingPayment != null && pendingPayment.isPresent()) {
            throw new IllegalStateException("Fuer diese Reservierung laeuft bereits eine Zahlung");
        }

        try {
            PaymentIntent intent = stripeService.createPaymentIntent(reservation.getTotalPrice(), reservationId);

            Payment payment = Payment.builder()
                    .reservationId(reservationId)
                    .stripePaymentIntentId(intent.getId())
                    .amount(reservation.getTotalPrice())
                    .status(StripePaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment);

            reservation.setStripePaymentIntentId(intent.getId());
            reservationRepository.save(reservation);

            return PaymentResponse.builder()
                    .clientSecret(intent.getClientSecret())
                    .paymentIntentId(intent.getId())
                    .amount(reservation.getTotalPrice())
                    .currency("eur")
                    .status("PENDING")
                    .build();

        } catch (Exception e) {
            if (e instanceof DataIntegrityViolationException) {
                throw new IllegalStateException("Fuer diese Reservierung laeuft bereits eine Zahlung", e);
            }
            log.error("Payment initiation failed for reservation {}", reservationId, e);
            throw new RuntimeException("Zahlung konnte nicht erstellt werden");
        }
    }

    @Transactional
    public void handlePaymentSuccess(String paymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zahlung nicht gefunden"));

        payment.setStatus(StripePaymentStatus.SUCCEEDED);
        paymentRepository.save(payment);

        Reservation reservation = reservationRepository.findById(payment.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));

        reservation.setPaymentStatus(ReservationPaymentStatus.PAID);
        reservation.setPaidAt(ZonedDateTime.now(AppConstants.VIENNA));
        reservationRepository.save(reservation);

        if (reservation.getCouponCode() != null && !reservation.getCouponCode().isBlank()) {
            couponService.incrementUsage(reservation.getCouponCode());
        }

        log.info("Payment succeeded for reservation {}", payment.getReservationId());
    }

    @Transactional
    public void handlePaymentFailure(String paymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Zahlung nicht gefunden"));

        payment.setStatus(StripePaymentStatus.FAILED);
        paymentRepository.save(payment);

        Reservation reservation = reservationRepository.findById(payment.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));

        reservation.setPaymentStatus(ReservationPaymentStatus.FAILED);
        reservationRepository.save(reservation);

        log.info("Payment failed for reservation {}", payment.getReservationId());
    }

    @Transactional
    public void markAsOnSite(Long reservationId, Long userId, boolean isAdmin) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));

        validateReservationOwnership(reservation, userId, isAdmin, null);

        if (reservation.getPaymentStatus() == ReservationPaymentStatus.PAID) {
            throw new IllegalStateException("Bezahlte Reservierungen können nicht als Vor-Ort markiert werden");
        }

        reservation.setPaymentStatus(ReservationPaymentStatus.ON_SITE);
        reservation.setPaymentMethod(PaymentMethod.ON_SITE);
        reservationRepository.save(reservation);
    }

    @Transactional
    public BigDecimal processRefund(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));

        validateReservationOwnershipAuthenticated(reservation);

        if (reservation.getPaymentStatus() != ReservationPaymentStatus.PAID) {
            throw new IllegalStateException("Nur bezahlte Reservierungen können erstattet werden");
        }

        long hoursUntilStart = Duration.between(ZonedDateTime.now(AppConstants.VIENNA), reservation.getStartTime())
                .toHours();

        int deadlineHours = appSettingsService.getInt("cancellation_deadline_hours", 48);
        if (hoursUntilStart < deadlineHours) {
            log.warn("Refund requested for reservation {} with only {} hours until start - no refund",
                    reservationId, hoursUntilStart);
            return BigDecimal.ZERO;
        }

        BigDecimal refundAmount = reservation.getTotalPrice().setScale(2, RoundingMode.HALF_UP);

        if (refundAmount.compareTo(BigDecimal.ZERO) > 0 && reservation.getStripePaymentIntentId() != null) {
            try {
                stripeService.refundPayment(reservation.getStripePaymentIntentId(), refundAmount);

                Payment payment = paymentRepository
                        .findByStripePaymentIntentId(reservation.getStripePaymentIntentId())
                        .orElse(null);
                if (payment != null) {
                    payment.setRefundAmount(refundAmount);
                    payment.setStatus(StripePaymentStatus.REFUNDED);
                    paymentRepository.save(payment);
                }
            } catch (Exception e) {
                log.error("Refund failed for reservation {}", reservationId, e);
                throw new RuntimeException("Erstattung fehlgeschlagen");
            }

            reservation.setPaymentStatus(ReservationPaymentStatus.REFUNDED);
            reservation.setRefundedAt(ZonedDateTime.now(AppConstants.VIENNA));
            reservationRepository.save(reservation);
        }

        return refundAmount;
    }

    @Transactional
    public BigDecimal processAdminRefund(Long reservationId, BigDecimal refundAmount) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservierung nicht gefunden"));

        if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Erstattungsbetrag muss größer als 0 sein.");
        }
        if (refundAmount.compareTo(reservation.getTotalPrice()) > 0) {
            throw new IllegalArgumentException(
                    "Erstattungsbetrag (" + refundAmount + " EUR) darf den Gesamtpreis (" +
                            reservation.getTotalPrice() + " EUR) nicht überschreiten.");
        }

        if (reservation.getStripePaymentIntentId() != null && refundAmount.compareTo(BigDecimal.ZERO) > 0) {
            try {
                stripeService.refundPayment(reservation.getStripePaymentIntentId(), refundAmount);

                Payment payment = paymentRepository
                        .findByStripePaymentIntentId(reservation.getStripePaymentIntentId())
                        .orElse(null);
                if (payment != null) {
                    payment.setRefundAmount(refundAmount);
                    payment.setStatus(refundAmount.compareTo(reservation.getTotalPrice()) >= 0
                            ? StripePaymentStatus.REFUNDED
                            : StripePaymentStatus.PARTIALLY_REFUNDED);
                    paymentRepository.save(payment);
                }
            } catch (Exception e) {
                log.error("Admin refund failed for reservation {}", reservationId, e);
                throw new RuntimeException("Erstattung fehlgeschlagen");
            }
        }

        reservation.setPaymentStatus(
                refundAmount.compareTo(reservation.getTotalPrice()) >= 0
                        ? ReservationPaymentStatus.REFUNDED
                        : ReservationPaymentStatus.PARTIALLY_REFUNDED);
        reservation.setRefundedAt(ZonedDateTime.now(AppConstants.VIENNA));
        reservationRepository.save(reservation);

        return refundAmount;
    }

    private void validateReservationOwnershipAuthenticated(Reservation reservation) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccessDeniedException("Nicht autorisiert");
        }

        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        Long currentUserId = auth.getPrincipal() instanceof Long ? (Long) auth.getPrincipal() : null;
        validateReservationOwnership(reservation, currentUserId, isAdmin, null);
    }

    private void validateReservationOwnership(
            Reservation reservation,
            Long userId,
            boolean isAdmin,
            String manageToken) {

        if (isAdmin) {
            return;
        }

        if (reservation.getUser() != null) {
            if (userId == null || !reservation.getUser().getId().equals(userId)) {
                throw new AccessDeniedException("Sie sind nicht berechtigt, diese Reservierung zu ändern");
            }
            return;
        }

        if (manageToken == null || manageToken.isBlank() || reservation.getManageTokenHash() == null) {
            throw new AccessDeniedException("Nicht autorisiert");
        }

        String providedHash = hashToken(manageToken.trim());
        if (!secureEqualsHex(providedHash, reservation.getManageTokenHash())) {
            throw new AccessDeniedException("Sie sind nicht berechtigt, diese Reservierung zu ändern");
        }
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private boolean secureEqualsHex(String left, String right) {
        if (left == null || right == null) {
            return false;
        }
        return MessageDigest.isEqual(
                left.getBytes(StandardCharsets.UTF_8),
                right.getBytes(StandardCharsets.UTF_8));
    }
}
