package com.halisaha.notification;

import com.halisaha.common.service.AppSettingsService;
import com.halisaha.notification.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppService {

    private final AppSettingsService settingsService;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GRAPH_API_URL = "https://graph.facebook.com/v21.0/%s/messages";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    public boolean isEnabled() {
        return settingsService.getBoolean("whatsapp_enabled", false);
    }

    private String getApiToken() {
        return settingsService.getString("whatsapp_api_token", "");
    }

    private String getPhoneNumberId() {
        return settingsService.getString("whatsapp_phone_number_id", "");
    }

    private boolean isMessageTypeEnabled(String type) {
        return settingsService.getBoolean("wa_msg_" + type + "_enabled", true);
    }

    private String getMessageTemplate(String type, String defaultText) {
        return settingsService.getString("wa_msg_" + type + "_text", defaultText);
    }

    @Async
    public void sendConfirmation(String phoneNumber, String customerName,
            String fieldName, ZonedDateTime startTime, ZonedDateTime endTime,
            BigDecimal totalPrice, String confirmationCode, Long reservationId) {
        if (!isEnabled() || !isMessageTypeEnabled("confirmation"))
            return;
        if (phoneNumber == null || phoneNumber.isBlank())
            return;

        String template = getMessageTemplate("confirmation",
                "Hallo {name}! ✅ Ihre Reservierung ist bestätigt.\n\n" +
                        "📋 Buchungs-Nr: {code}\n" +
                        "⚽ Platz: {field}\n" +
                        "📅 Datum: {date}\n" +
                        "🕐 Zeit: {time}\n" +
                        "💰 Preis: {price} €\n\n" +
                        "Wir freuen uns auf Sie! ⚽");

        String message = replacePlaceholders(template, customerName, fieldName,
                startTime, endTime, totalPrice, confirmationCode);

        sendWhatsAppMessage(phoneNumber, message, reservationId, NotificationPurpose.CONFIRMATION);
    }

    @Async
    public void sendCancellation(String phoneNumber, String customerName,
            String fieldName, ZonedDateTime startTime,
            String confirmationCode, Long reservationId) {
        if (!isEnabled() || !isMessageTypeEnabled("cancellation"))
            return;
        if (phoneNumber == null || phoneNumber.isBlank())
            return;

        String template = getMessageTemplate("cancellation",
                "Hallo {name}, Ihre Reservierung wurde storniert.\n\n" +
                        "📋 Buchungs-Nr: {code}\n" +
                        "⚽ Platz: {field}\n" +
                        "📅 Datum: {date}\n\n" +
                        "Falls dies ein Fehler war, kontaktieren Sie uns bitte.");

        String message = replacePlaceholders(template, customerName, fieldName,
                startTime, null, null, confirmationCode);

        sendWhatsAppMessage(phoneNumber, message, reservationId, NotificationPurpose.CANCELLATION);
    }

    @Async
    public void sendModification(String phoneNumber, String customerName,
            String fieldName, ZonedDateTime newStartTime, ZonedDateTime newEndTime,
            String confirmationCode, Long reservationId) {
        if (!isEnabled() || !isMessageTypeEnabled("modification"))
            return;
        if (phoneNumber == null || phoneNumber.isBlank())
            return;

        String template = getMessageTemplate("modification",
                "Hallo {name}, Ihre Reservierung wurde geändert.\n\n" +
                        "📋 Buchungs-Nr: {code}\n" +
                        "⚽ Platz: {field}\n" +
                        "📅 Neues Datum: {date}\n" +
                        "🕐 Neue Zeit: {time}\n\n" +
                        "Vielen Dank!");

        String message = replacePlaceholders(template, customerName, fieldName,
                newStartTime, newEndTime, null, confirmationCode);

        sendWhatsAppMessage(phoneNumber, message, reservationId, NotificationPurpose.MODIFICATION);
    }

    @Async
    public void sendCouponNotification(String phoneNumber, String customerName,
            String couponCode, BigDecimal discountAmount, Long reservationId) {
        if (!isEnabled() || !isMessageTypeEnabled("coupon"))
            return;
        if (phoneNumber == null || phoneNumber.isBlank())
            return;

        String template = getMessageTemplate("coupon",
                "🎉 Hallo {name}! Sie haben einen Gutschein eingelöst!\n\n" +
                        "🎫 Gutschein: {code}\n" +
                        "💰 Ersparnis: {price} €\n\n" +
                        "Vielen Dank für Ihre Buchung!");

        String message = template
                .replace("{name}", customerName != null ? customerName : "")
                .replace("{code}", couponCode != null ? couponCode : "")
                .replace("{price}", discountAmount != null ? discountAmount.toPlainString() : "0");

        sendWhatsAppMessage(phoneNumber, message, reservationId, NotificationPurpose.COUPON);
    }

    private String replacePlaceholders(String template, String name, String field,
            ZonedDateTime start, ZonedDateTime end, BigDecimal price, String code) {
        String result = template
                .replace("{name}", name != null ? name : "")
                .replace("{field}", field != null ? field : "")
                .replace("{code}", code != null ? code : "");

        if (start != null) {
            result = result
                    .replace("{date}", start.format(DATE_FMT))
                    .replace("{time}", start.format(TIME_FMT) +
                            (end != null ? " - " + end.format(TIME_FMT) : ""));
        }
        if (price != null) {
            result = result.replace("{price}", price.toPlainString());
        }
        return result;
    }

    private void sendWhatsAppMessage(String phoneNumber, String messageText,
            Long reservationId, NotificationPurpose purpose) {
        String token = getApiToken();
        String phoneNumberId = getPhoneNumberId();

        if (token.isBlank() || phoneNumberId.isBlank()) {
            log.warn("WhatsApp API token or phone number ID not configured, skipping WA message");
            return;
        }

        String normalized = normalizePhoneNumber(phoneNumber);

        Notification notification = notificationService.createNotification(
                reservationId, NotificationType.WHATSAPP,
                purpose, normalized, messageText);

        try {
            String url = String.format(GRAPH_API_URL, phoneNumberId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);

            Map<String, Object> body = Map.of(
                    "messaging_product", "whatsapp",
                    "to", normalized,
                    "type", "text",
                    "text", Map.of("body", messageText));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                notificationService.markSent(notification);
                log.info("WhatsApp message sent to {} for reservation {}", normalized, reservationId);
            } else {
                notificationService.markFailed(notification, "HTTP " + response.getStatusCode());
                log.error("WhatsApp API returned {}: {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            notificationService.markFailed(notification, e.getMessage());
            log.error("Failed to send WhatsApp message to {}: {}", normalized, e.getMessage());
        }
    }

    private String normalizePhoneNumber(String phone) {
        if (phone == null)
            return "";
        String cleaned = phone.replaceAll("[\\s\\-().]", "");
        if (cleaned.startsWith("0") && !cleaned.startsWith("00")) {
            cleaned = "+43" + cleaned.substring(1);
        }
        if (cleaned.startsWith("0043")) {
            cleaned = "+" + cleaned.substring(2);
        }
        if (!cleaned.startsWith("+")) {
            cleaned = "+43" + cleaned;
        }
        return cleaned;
    }
}
