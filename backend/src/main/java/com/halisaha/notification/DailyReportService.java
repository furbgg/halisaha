package com.halisaha.notification;

import com.halisaha.common.AppConstants;
import com.halisaha.common.service.AppSettingsService;
import com.halisaha.notification.repository.NotificationRepository;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.ReservationStatus;
import com.halisaha.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyReportService {

    private final ReservationRepository reservationRepository;
    private final NotificationRepository notificationRepository;
    private final AppSettingsService appSettingsService;
    private final EmailService emailService;

    public void generateAndSendReport(LocalDate date) {
        String adminEmail = appSettingsService.getAdminEmail();
        if (adminEmail == null || adminEmail.isBlank()) {
            log.warn("No admin email configured, skipping daily report");
            return;
        }

        ZonedDateTime dayStart = date.atStartOfDay(AppConstants.VIENNA);
        ZonedDateTime dayEnd = date.plusDays(1).atStartOfDay(AppConstants.VIENNA);

        List<Reservation> allReservations = reservationRepository.findByDateRange(dayStart, dayEnd);

        Map<String, Object> reportData = new HashMap<>();
        reportData.put("reportDate", date.format(java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy")));

        long totalReservations = allReservations.size();
        long confirmedCount = allReservations.stream()
            .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED || r.getStatus() == ReservationStatus.COMPLETED)
            .count();
        long cancelledCount = allReservations.stream()
            .filter(r -> r.getStatus() == ReservationStatus.CANCELLED)
            .count();

        reportData.put("totalReservations", totalReservations);
        reportData.put("confirmedCount", confirmedCount);
        reportData.put("cancelledCount", cancelledCount);

        BigDecimal totalRevenue = allReservations.stream()
            .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
            .map(Reservation::getTotalPrice)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        reportData.put("totalRevenue", totalRevenue);

        Map<String, Long> fieldCounts = allReservations.stream()
            .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
            .filter(r -> r.getField() != null)
            .collect(Collectors.groupingBy(r -> r.getField().getName(), Collectors.counting()));
        reportData.put("fieldCounts", fieldCounts);

        Map<Integer, Long> hourlyBookings = allReservations.stream()
            .filter(r -> r.getStatus() != ReservationStatus.CANCELLED)
            .collect(Collectors.groupingBy(r -> r.getStartTime().getHour(), Collectors.counting()));
        reportData.put("hourlyBookings", hourlyBookings);

        Map<String, Long> paymentMethods = allReservations.stream()
            .filter(r -> r.getStatus() != ReservationStatus.CANCELLED && r.getPaymentMethod() != null)
            .collect(Collectors.groupingBy(r -> r.getPaymentMethod().name(), Collectors.counting()));
        reportData.put("paymentMethods", paymentMethods);

        long couponUsageCount = allReservations.stream()
            .filter(r -> r.getCouponCode() != null && !r.getCouponCode().isBlank())
            .count();
        BigDecimal totalDiscount = allReservations.stream()
            .filter(r -> r.getDiscountAmount() != null)
            .map(Reservation::getDiscountAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        reportData.put("couponUsageCount", couponUsageCount);
        reportData.put("totalDiscount", totalDiscount);

        long sentNotifications = notificationRepository.countByStatus(NotificationStatus.SENT);
        long failedNotifications = notificationRepository.countByStatus(NotificationStatus.FAILED);
        reportData.put("sentNotifications", sentNotifications);
        reportData.put("failedNotifications", failedNotifications);

        emailService.sendDailyReport(adminEmail, reportData);
        log.info("Daily report sent for {} to {}", date, adminEmail);
    }
}
