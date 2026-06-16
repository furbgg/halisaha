package com.halisaha.notification;

import com.halisaha.common.AppConstants;

import com.halisaha.common.service.AppSettingsService;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final ReservationRepository reservationRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final AppSettingsService appSettingsService;

    /**
     * Runs every 15 minutes.
     * Finds reservations starting within the next hour (configurable via app_settings)
     * that have notification_consent = true and haven't received a reminder yet.
     */
    @Scheduled(fixedRate = 900000)
    public void sendReminders() {
        int reminderHoursBefore = appSettingsService.getInt("reminder_hours_before", 1);

        ZonedDateTime now = ZonedDateTime.now(AppConstants.VIENNA);
        ZonedDateTime from = now.plusMinutes(reminderHoursBefore * 60 - 15);
        ZonedDateTime to = now.plusMinutes(reminderHoursBefore * 60 + 15);

        List<Reservation> upcoming = reservationRepository.findUpcomingForReminder(from, to);

        for (Reservation reservation : upcoming) {
            if (notificationService.wasReminderAlreadySent(reservation.getId())) {
                continue;
            }

            String email = getEmail(reservation);
            String name = getName(reservation);

            if (email == null || email.isBlank()) {
                log.debug("No email for reservation {}, skipping reminder", reservation.getConfirmationCode());
                continue;
            }

            try {
                emailService.sendReminder(
                        email, name,
                        reservation.getField().getName(),
                        reservation.getStartTime(),
                        reservation.getEndTime(),
                        reservation.getConfirmationCode(),
                        reservation.getId()
                );
                log.info("Reminder sent for reservation {}", reservation.getConfirmationCode());
            } catch (Exception e) {
                log.error("Failed to send reminder for reservation {}",
                        reservation.getConfirmationCode(), e);
            }
        }
    }

    private String getEmail(Reservation reservation) {
        if (reservation.getUser() != null) {
            return reservation.getUser().getEmail();
        }
        return reservation.getGuestEmail();
    }

    private String getName(Reservation reservation) {
        if (reservation.getUser() != null) {
            return reservation.getUser().getName();
        }
        return reservation.getGuestName();
    }
}
