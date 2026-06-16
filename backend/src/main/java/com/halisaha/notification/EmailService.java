package com.halisaha.notification;

import com.halisaha.common.service.AppSettingsService;
import com.halisaha.notification.entity.Notification;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final NotificationService notificationService;
    private final EmailDeliveryService emailDeliveryService;
    private final WhatsAppService whatsAppService;
    private final AppSettingsService appSettingsService;

    @Value("${spring.mail.username:noreply@halisaha.at}")
    private String fromEmail;

    @Value("${app.base-url:https://halisaha.at}")
    private String baseUrl;

    @Value("${app.company-name:SoccerArena}")
    private String companyName;

    @Value("${app.admin-portal-path:/portal-salamanda-soccer-arena-portal}")
    private String adminPortalPath;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final Locale DE = Locale.GERMAN;

    private Context createContext() {
        Context context = new Context(DE);
        context.setVariable("logoUrl", baseUrl + "/images/logo_dark.png");
        context.setVariable("baseUrl", baseUrl);
        return context;
    }

    @Async
    public void sendConfirmation(String recipientEmail, String customerName,
            String fieldName, ZonedDateTime startTime, ZonedDateTime endTime,
            int durationMinutes, BigDecimal totalPrice,
            String confirmationCode, Long reservationId) {
        sendConfirmation(recipientEmail, customerName, fieldName, startTime, endTime,
                durationMinutes, totalPrice, confirmationCode, reservationId, null, null);
    }

    @Async
    public void sendConfirmation(String recipientEmail, String customerName,
            String fieldName, ZonedDateTime startTime, ZonedDateTime endTime,
            int durationMinutes, BigDecimal totalPrice,
            String confirmationCode, Long reservationId, String phoneNumber) {
        sendConfirmation(recipientEmail, customerName, fieldName, startTime, endTime,
                durationMinutes, totalPrice, confirmationCode, reservationId, phoneNumber, null);
    }

    @Async
    public void sendConfirmation(String recipientEmail, String customerName,
            String fieldName, ZonedDateTime startTime, ZonedDateTime endTime,
            int durationMinutes, BigDecimal totalPrice,
            String confirmationCode, Long reservationId, String phoneNumber, String manageToken) {
        if (appSettingsService.getBoolean("email_notifications_enabled", true)) {
            Context context = createContext();
            context.setVariable("customerName", customerName);
            context.setVariable("fieldName", fieldName);
            context.setVariable("date", startTime.format(DATE_FORMAT));
            context.setVariable("startTime", startTime.format(TIME_FORMAT));
            context.setVariable("endTime", endTime.format(TIME_FORMAT));
            context.setVariable("durationMinutes", durationMinutes);
            context.setVariable("totalPrice", totalPrice);
            context.setVariable("confirmationCode", confirmationCode);
            context.setVariable("manageUrl", buildManageUrl(confirmationCode, manageToken));

            String html = templateEngine.process("email/confirmation", context);
            String subject = "Reservierungsbestaetigung - " + confirmationCode;

            Notification notification = notificationService.createNotification(
                    reservationId, NotificationType.EMAIL,
                    NotificationPurpose.CONFIRMATION, recipientEmail, subject);

            sendEmail(recipientEmail, subject, html, notification);
        }

        whatsAppService.sendConfirmation(phoneNumber, customerName, fieldName,
                startTime, endTime, totalPrice, confirmationCode, reservationId);
    }

    @Async
    public void sendReminder(String recipientEmail, String customerName,
            String fieldName, ZonedDateTime startTime, ZonedDateTime endTime,
            String confirmationCode, Long reservationId) {
        Context context = createContext();
        context.setVariable("customerName", customerName);
        context.setVariable("fieldName", fieldName);
        context.setVariable("date", startTime.format(DATE_FORMAT));
        context.setVariable("startTime", startTime.format(TIME_FORMAT));
        context.setVariable("endTime", endTime.format(TIME_FORMAT));
        context.setVariable("confirmationCode", confirmationCode);
        context.setVariable("manageUrl", buildManageUrl(confirmationCode, null));

        String html = templateEngine.process("email/reminder", context);
        String subject = "Erinnerung: Ihre Reservierung heute um " + startTime.format(TIME_FORMAT);

        Notification notification = notificationService.createNotification(
                reservationId, NotificationType.EMAIL,
                NotificationPurpose.REMINDER, recipientEmail, subject);

        sendEmail(recipientEmail, subject, html, notification);
    }

    @Async
    public void sendCancellation(String recipientEmail, String customerName,
            String fieldName, ZonedDateTime startTime,
            String confirmationCode, Long reservationId) {
        sendCancellation(recipientEmail, customerName, fieldName, startTime,
                confirmationCode, reservationId, null);
    }

    @Async
    public void sendCancellation(String recipientEmail, String customerName,
            String fieldName, ZonedDateTime startTime,
            String confirmationCode, Long reservationId, String phoneNumber) {
        if (appSettingsService.getBoolean("email_notifications_enabled", true)) {
            Context context = createContext();
            context.setVariable("customerName", customerName);
            context.setVariable("fieldName", fieldName);
            context.setVariable("date", startTime.format(DATE_FORMAT));
            context.setVariable("startTime", startTime.format(TIME_FORMAT));
            context.setVariable("confirmationCode", confirmationCode);

            String html = templateEngine.process("email/cancellation", context);
            String subject = "Stornierungsbestaetigung - " + confirmationCode;

            Notification notification = notificationService.createNotification(
                    reservationId, NotificationType.EMAIL,
                    NotificationPurpose.CANCELLATION, recipientEmail, subject);

            sendEmail(recipientEmail, subject, html, notification);
        }

        whatsAppService.sendCancellation(phoneNumber, customerName, fieldName,
                startTime, confirmationCode, reservationId);
    }

    @Async
    public void sendModification(String recipientEmail, String customerName,
            String fieldName, ZonedDateTime oldStart, ZonedDateTime oldEnd,
            ZonedDateTime newStart, ZonedDateTime newEnd,
            String confirmationCode, Long reservationId, String phoneNumber) {
        if (appSettingsService.getBoolean("email_notifications_enabled", true)) {
            Context context = createContext();
            context.setVariable("customerName", customerName);
            context.setVariable("fieldName", fieldName);
            context.setVariable("oldDate", oldStart.format(DATE_FORMAT));
            context.setVariable("oldTime", oldStart.format(TIME_FORMAT));
            context.setVariable("newDate", newStart.format(DATE_FORMAT));
            context.setVariable("newTime", newStart.format(TIME_FORMAT) + " - " + newEnd.format(TIME_FORMAT));
            context.setVariable("confirmationCode", confirmationCode);
            context.setVariable("manageUrl", buildManageUrl(confirmationCode, null));

            String html = templateEngine.process("email/modification", context);
            String subject = "Terminaenderung - " + confirmationCode;

            Notification notification = notificationService.createNotification(
                    reservationId, NotificationType.EMAIL,
                    NotificationPurpose.MODIFICATION, recipientEmail, subject);

            sendEmail(recipientEmail, subject, html, notification);
        }

        whatsAppService.sendModification(phoneNumber, customerName, fieldName,
                newStart, newEnd, confirmationCode, reservationId);
    }

    @Async
    public void sendPasswordReset(String recipientEmail, String customerName, String resetToken) {
        Context context = createContext();
        String portalPath = adminPortalPath.startsWith("/") ? adminPortalPath : "/" + adminPortalPath;
        context.setVariable("customerName", customerName);
        context.setVariable("resetUrl", baseUrl + portalPath + "/passwort-zuruecksetzen?token=" + resetToken);
        context.setVariable("expiryHours", 1);

        String html = templateEngine.process("email/password-reset", context);
        String subject = "Passwort zuruecksetzen - " + companyName;

        Notification notification = notificationService.createNotification(
                null, NotificationType.EMAIL,
                NotificationPurpose.PASSWORD_RESET, recipientEmail, subject);

        sendEmail(recipientEmail, subject, html, notification);
    }

    @Async
    public void sendAdminInvite(String recipientEmail, String adminName, String temporaryPassword) {
        Context context = createContext();
        context.setVariable("adminName", adminName);
        context.setVariable("adminEmail", recipientEmail);
        context.setVariable("temporaryPassword", temporaryPassword);
        context.setVariable("loginUrl", baseUrl + adminPortalPath);

        String html = templateEngine.process("email/admin-invite", context);
        String subject = "Admin-Zugang erstellt - " + companyName;

        Notification notification = notificationService.createNotification(
                null, NotificationType.EMAIL,
                NotificationPurpose.ADMIN_INVITE, recipientEmail, subject);

        sendEmail(recipientEmail, subject, html, notification);
    }

    @Async
    public void sendDailyReport(String adminEmail, Map<String, Object> reportData) {
        Context context = createContext();
        reportData.forEach(context::setVariable);

        String html = templateEngine.process("email/daily-report", context);
        String date = (String) reportData.get("reportDate");
        String subject = "Tagesbericht - " + companyName + " - " + date;

        Notification notification = notificationService.createNotification(
            null, NotificationType.EMAIL,
            NotificationPurpose.DAILY_REPORT, adminEmail, subject);

        sendEmail(adminEmail, subject, html, notification);
    }

    private String buildManageUrl(String confirmationCode, String manageToken) {
        String baseManageUrl = baseUrl + "/reservierung/verwalten/" + confirmationCode;
        if (manageToken == null || manageToken.isBlank()) {
            return baseManageUrl;
        }
        return baseManageUrl + "#mt=" + manageToken;
    }

    private void sendEmail(String to, String subject, String html, Notification notification) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            ClassPathResource logoResource = new ClassPathResource("static/images/logo_dark.png");
            if (logoResource.exists()) {
                helper.addInline("logo", logoResource, "image/png");
            }

            emailDeliveryService.deliver(message, notification);

        } catch (MessagingException e) {
            log.error("Failed to construct email for notification ID: {}", notification.getId(), e);
            notificationService.markFailed(notification, e.getMessage());
        }
    }
}
