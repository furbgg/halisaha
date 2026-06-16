package com.halisaha.notification;

import com.halisaha.common.AppConstants;

import com.halisaha.notification.entity.Notification;
import com.halisaha.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    static final int MAX_SCHEDULED_RETRIES = 3;
    private static final long[] RETRY_DELAYS_MINUTES = {5, 30, 120};

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(Long reservationId, NotificationType type,
            NotificationPurpose purpose, String recipient, String content) {
        Notification notification = Notification.builder()
                .reservationId(reservationId)
                .type(type)
                .purpose(purpose)
                .recipient(recipient)
                .content(content)
                .status(NotificationStatus.PENDING)
                .build();
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markSent(Notification notification) {
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(ZonedDateTime.now(AppConstants.VIENNA));
        notificationRepository.save(notification);
    }

    @Transactional
    public void markFailed(Notification notification, String errorMessage) {
        notification.setStatus(NotificationStatus.FAILED);
        notification.setErrorMessage(errorMessage);
        int retryCount = notification.getRetryCount();
        if (retryCount < MAX_SCHEDULED_RETRIES) {
            long delayMinutes = RETRY_DELAYS_MINUTES[Math.min(retryCount, RETRY_DELAYS_MINUTES.length - 1)];
            notification.setNextRetryAt(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(delayMinutes));
        }
        notificationRepository.save(notification);
    }

    @Transactional
    public void incrementRetryCount(Notification notification) {
        notification.setRetryCount(notification.getRetryCount() + 1);
        notification.setStatus(NotificationStatus.PENDING);
        notification.setNextRetryAt(null);
        notification.setErrorMessage(null);
        notificationRepository.save(notification);
    }

    public List<Notification> findRetryable() {
        return notificationRepository.findRetryable(
                MAX_SCHEDULED_RETRIES,
                ZonedDateTime.now(AppConstants.VIENNA));
    }

    public boolean wasReminderAlreadySent(Long reservationId) {
        return !notificationRepository
                .findByReservationIdAndPurpose(reservationId, NotificationPurpose.REMINDER)
                .isEmpty();
    }
}
