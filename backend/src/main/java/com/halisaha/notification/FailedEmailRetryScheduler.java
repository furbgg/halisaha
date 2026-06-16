package com.halisaha.notification;

import com.halisaha.notification.entity.Notification;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FailedEmailRetryScheduler {

    private final NotificationService notificationService;
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Scheduled(fixedRate = 300000) // every 5 minutes
    public void retryFailedEmails() {
        List<Notification> retryable = notificationService.findRetryable();
        if (retryable.isEmpty()) {
            return;
        }

        log.info("Found {} failed emails eligible for retry", retryable.size());

        for (Notification notification : retryable) {
            try {
                notificationService.incrementRetryCount(notification);

                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(notification.getRecipient());
                helper.setSubject(notification.getContent());
                helper.setText(buildRetryHtml(notification), true);

                ClassPathResource logoResource = new ClassPathResource("static/images/logo_dark.png");
                if (logoResource.exists()) {
                    helper.addInline("logo", logoResource, "image/png");
                }

                mailSender.send(message);
                notificationService.markSent(notification);
                log.info("Retry successful for notification ID: {}", notification.getId());

            } catch (MessagingException e) {
                log.error("Retry failed for notification ID: {} (attempt {})",
                        notification.getId(), notification.getRetryCount(), e);
                notificationService.markFailed(notification, e.getMessage());
            } catch (Exception e) {
                log.error("Unexpected error retrying notification ID: {}", notification.getId(), e);
                notificationService.markFailed(notification, e.getMessage());
            }
        }
    }

    private String buildRetryHtml(Notification notification) {
        String templateName = resolveTemplate(notification.getPurpose());
        if (templateName == null) {
            return "<p>" + notification.getContent() + "</p>";
        }
        // For retries we send a simplified version since we don't have the original template variables
        return "<html><body style='font-family:Arial,sans-serif;background:#1a1a1a;color:#f1f5f9;padding:40px;'>"
                + "<div style='max-width:600px;margin:0 auto;background:#242424;border-radius:12px;padding:32px;'>"
                + "<h2 style='color:#ff4400;'>" + notification.getContent() + "</h2>"
                + "<p>Diese E-Mail wurde erneut gesendet, da die urspruengliche Zustellung fehlgeschlagen ist.</p>"
                + "<p style='color:#999;font-size:12px;margin-top:24px;'>Automatisch erneut gesendet</p>"
                + "</div></body></html>";
    }

    private String resolveTemplate(NotificationPurpose purpose) {
        return switch (purpose) {
            case CONFIRMATION -> "email/confirmation";
            case REMINDER -> "email/reminder";
            case CANCELLATION -> "email/cancellation";
            case MODIFICATION -> "email/modification";
            case PASSWORD_RESET -> "email/password-reset";
            default -> null;
        };
    }
}
