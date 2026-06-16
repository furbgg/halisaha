package com.halisaha.notification;

import com.halisaha.notification.entity.Notification;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailDeliveryService {

    private final JavaMailSender mailSender;
    private final NotificationService notificationService;

    @Retryable(value = { Exception.class }, maxAttempts = 3, backoff = @Backoff(delay = 2000, multiplier = 2))
    public void deliver(MimeMessage message, Notification notification) {
        log.info("Attempting to send email for notification ID: {}", notification.getId());
        mailSender.send(message);
        notificationService.markSent(notification);
        log.info("Email successfully sent to recipient for reservation notification ID: {}", notification.getId());
    }

    @Recover
    public void recover(Exception e, MimeMessage message, Notification notification) {
        log.error("Failed to send email after retries for notification ID: {}", notification.getId(), e);
        notificationService.markFailed(notification, e.getMessage());
    }
}
