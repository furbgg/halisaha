package com.halisaha.notification;

import com.halisaha.common.service.AppSettingsService;
import com.halisaha.reservation.entity.Reservation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminAlertService {

    private final NotificationService notificationService;
    private final AppSettingsService appSettingsService;

    @Async
    public void notifyNewReservation(Reservation reservation) {
        if (!appSettingsService.getBoolean("admin_new_booking", true)) {
            return;
        }

        String fieldName = reservation.getField() != null ? reservation.getField().getName() : "Unbekannt";
        String customerName = reservation.getUser() != null
            ? reservation.getUser().getName()
            : reservation.getGuestName();

        String content = String.format("Neue Reservierung: %s - %s, %s",
            reservation.getConfirmationCode(), fieldName, customerName);

        notificationService.createNotification(
            reservation.getId(),
            NotificationType.EMAIL,
            NotificationPurpose.NEW_BOOKING_ALERT,
            "admin",
            content
        );

        log.info("Admin alert created for new reservation {}", reservation.getConfirmationCode());
    }
}
