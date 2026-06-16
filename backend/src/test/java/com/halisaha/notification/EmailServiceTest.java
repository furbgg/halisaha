package com.halisaha.notification;

import com.halisaha.common.AppConstants;

import com.halisaha.notification.entity.Notification;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmailService — E-Mail-Versand fuer Reservierungen")
class EmailServiceTest {

        @Mock
        private JavaMailSender mailSender;
        @Mock
        private TemplateEngine templateEngine;
        @Mock
        private NotificationService notificationService;
        @Mock
        private EmailDeliveryService emailDeliveryService;
        @Mock
        private com.halisaha.common.service.AppSettingsService appSettingsService;
        @Mock
        private com.halisaha.notification.WhatsAppService whatsAppService;

        @InjectMocks
        private EmailService emailService;

        private Notification mockNotification;

        @BeforeEach
        void setUp() {
                ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@halisaha.at");
                ReflectionTestUtils.setField(emailService, "baseUrl", "https://halisaha.at");

                mockNotification = Notification.builder()
                                .id(1L)
                                .reservationId(100L)
                                .type(NotificationType.EMAIL)
                                .status(NotificationStatus.PENDING)
                                .build();

                lenient().when(appSettingsService.getBoolean("email_notifications_enabled", true)).thenReturn(true);
        }


        @Nested
        @DisplayName("Bestaetigungsemail")
        class SendConfirmationTests {

                @Test
                @DisplayName("Bestaetigungsemail wird mit korrektem Template verarbeitet")
                void sendConfirmation_processesCorrectTemplate() {
                        MimeMessage mimeMessage = mock(MimeMessage.class);
                        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
                        when(templateEngine.process(eq("email/confirmation"), any(Context.class)))
                                        .thenReturn("<html>Confirmation</html>");
                        when(notificationService.createNotification(anyLong(), any(), any(), anyString(), anyString()))
                                        .thenReturn(mockNotification);

                        emailService.sendConfirmation(
                                        "kunde@test.com", "Max Mustermann", "Platz 1",
                                        ZonedDateTime.of(2026, 3, 1, 18, 0, 0, 0, AppConstants.VIENNA),
                                        ZonedDateTime.of(2026, 3, 1, 19, 0, 0, 0, AppConstants.VIENNA),
                                        60, new BigDecimal("50.00"), "RES-ABC123", 100L);

                        verify(templateEngine).process(eq("email/confirmation"), any(Context.class));
                }

                @Test
                @DisplayName("Bestaetigungsemail erstellt Notification mit CONFIRMATION-Zweck")
                void sendConfirmation_createsNotificationWithConfirmationPurpose() {
                        MimeMessage mimeMessage = mock(MimeMessage.class);
                        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
                        when(templateEngine.process(anyString(), any(Context.class)))
                                        .thenReturn("<html>Test</html>");
                        when(notificationService.createNotification(anyLong(), any(), any(), anyString(), anyString()))
                                        .thenReturn(mockNotification);

                        emailService.sendConfirmation(
                                        "kunde@test.com", "Max", "Platz 1",
                                        ZonedDateTime.of(2026, 3, 1, 18, 0, 0, 0, AppConstants.VIENNA),
                                        ZonedDateTime.of(2026, 3, 1, 19, 0, 0, 0, AppConstants.VIENNA),
                                        60, new BigDecimal("50.00"), "RES-ABC123", 100L);

                        verify(notificationService).createNotification(
                                        eq(100L), eq(NotificationType.EMAIL),
                                        eq(NotificationPurpose.CONFIRMATION),
                                        eq("kunde@test.com"),
                                        contains("RES-ABC123"));
                }

                @Test
                @DisplayName("Bestaetigungsemail delegiert an EmailDeliveryService")
                void sendConfirmation_marksNotificationAsSent() {
                        MimeMessage mimeMessage = mock(MimeMessage.class);
                        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
                        when(templateEngine.process(anyString(), any(Context.class)))
                                        .thenReturn("<html>Test</html>");
                        when(notificationService.createNotification(anyLong(), any(), any(), anyString(), anyString()))
                                        .thenReturn(mockNotification);

                        emailService.sendConfirmation(
                                        "kunde@test.com", "Max", "Platz 1",
                                        ZonedDateTime.of(2026, 3, 1, 18, 0, 0, 0, AppConstants.VIENNA),
                                        ZonedDateTime.of(2026, 3, 1, 19, 0, 0, 0, AppConstants.VIENNA),
                                        60, new BigDecimal("50.00"), "RES-ABC123", 100L);

                        verify(emailDeliveryService).deliver(eq(mimeMessage), eq(mockNotification));
                }

                @Test
                @DisplayName("Bestaetigungsemail enthaelt korrekte Betreffzeile")
                void sendConfirmation_hasCorrectSubject() {
                        MimeMessage mimeMessage = mock(MimeMessage.class);
                        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
                        when(templateEngine.process(anyString(), any(Context.class)))
                                        .thenReturn("<html>Test</html>");
                        when(notificationService.createNotification(anyLong(), any(), any(), anyString(), anyString()))
                                        .thenReturn(mockNotification);

                        emailService.sendConfirmation(
                                        "kunde@test.com", "Max", "Platz 1",
                                        ZonedDateTime.of(2026, 3, 1, 18, 0, 0, 0, AppConstants.VIENNA),
                                        ZonedDateTime.of(2026, 3, 1, 19, 0, 0, 0, AppConstants.VIENNA),
                                        60, new BigDecimal("50.00"), "RES-XYZ789", 100L);

                        verify(notificationService).createNotification(
                                        anyLong(), any(), any(), anyString(),
                                        argThat(subject -> subject.contains("RES-XYZ789")
                                                        && subject.contains("Reservierungsbestaetigung")));
                }
        }


        @Nested
        @DisplayName("Erinnerungsemail")
        class SendReminderTests {

                @Test
                @DisplayName("Erinnerungsemail wird mit korrektem Template verarbeitet")
                void sendReminder_processesCorrectTemplate() {
                        MimeMessage mimeMessage = mock(MimeMessage.class);
                        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
                        when(templateEngine.process(eq("email/reminder"), any(Context.class)))
                                        .thenReturn("<html>Reminder</html>");
                        when(notificationService.createNotification(anyLong(), any(), any(), anyString(), anyString()))
                                        .thenReturn(mockNotification);

                        emailService.sendReminder(
                                        "kunde@test.com", "Max", "Platz 1",
                                        ZonedDateTime.of(2026, 3, 1, 18, 0, 0, 0, AppConstants.VIENNA),
                                        ZonedDateTime.of(2026, 3, 1, 19, 0, 0, 0, AppConstants.VIENNA),
                                        "RES-ABC123", 100L);

                        verify(templateEngine).process(eq("email/reminder"), any(Context.class));
                }

                @Test
                @DisplayName("Erinnerungsemail erstellt Notification mit REMINDER-Zweck")
                void sendReminder_createsNotificationWithReminderPurpose() {
                        MimeMessage mimeMessage = mock(MimeMessage.class);
                        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
                        when(templateEngine.process(anyString(), any(Context.class)))
                                        .thenReturn("<html>Test</html>");
                        when(notificationService.createNotification(anyLong(), any(), any(), anyString(), anyString()))
                                        .thenReturn(mockNotification);

                        emailService.sendReminder(
                                        "kunde@test.com", "Max", "Platz 1",
                                        ZonedDateTime.of(2026, 3, 1, 18, 0, 0, 0, AppConstants.VIENNA),
                                        ZonedDateTime.of(2026, 3, 1, 19, 0, 0, 0, AppConstants.VIENNA),
                                        "RES-ABC123", 100L);

                        verify(notificationService).createNotification(
                                        eq(100L), eq(NotificationType.EMAIL),
                                        eq(NotificationPurpose.REMINDER),
                                        eq("kunde@test.com"),
                                        contains("Erinnerung"));
                }

                @Test
                @DisplayName("Erinnerungsemail enthaelt Uhrzeit im Betreff")
                void sendReminder_subjectContainsTime() {
                        MimeMessage mimeMessage = mock(MimeMessage.class);
                        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
                        when(templateEngine.process(anyString(), any(Context.class)))
                                        .thenReturn("<html>Test</html>");
                        when(notificationService.createNotification(anyLong(), any(), any(), anyString(), anyString()))
                                        .thenReturn(mockNotification);

                        emailService.sendReminder(
                                        "kunde@test.com", "Max", "Platz 1",
                                        ZonedDateTime.of(2026, 3, 1, 18, 0, 0, 0, AppConstants.VIENNA),
                                        ZonedDateTime.of(2026, 3, 1, 19, 0, 0, 0, AppConstants.VIENNA),
                                        "RES-ABC123", 100L);

                        verify(notificationService).createNotification(
                                        anyLong(), any(), any(), anyString(),
                                        argThat(subject -> subject.contains("18:00")));
                }
        }


        @Nested
        @DisplayName("Stornierungsemail")
        class SendCancellationTests {

                @Test
                @DisplayName("Stornierungsemail wird mit korrektem Template verarbeitet")
                void sendCancellation_processesCorrectTemplate() {
                        MimeMessage mimeMessage = mock(MimeMessage.class);
                        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
                        when(templateEngine.process(eq("email/cancellation"), any(Context.class)))
                                        .thenReturn("<html>Cancellation</html>");
                        when(notificationService.createNotification(anyLong(), any(), any(), anyString(), anyString()))
                                        .thenReturn(mockNotification);

                        emailService.sendCancellation(
                                        "kunde@test.com", "Max", "Platz 1",
                                        ZonedDateTime.of(2026, 3, 1, 18, 0, 0, 0, AppConstants.VIENNA),
                                        "RES-ABC123", 100L);

                        verify(templateEngine).process(eq("email/cancellation"), any(Context.class));
                }

                @Test
                @DisplayName("Stornierungsemail erstellt Notification mit CANCELLATION-Zweck")
                void sendCancellation_createsNotificationWithCancellationPurpose() {
                        MimeMessage mimeMessage = mock(MimeMessage.class);
                        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
                        when(templateEngine.process(anyString(), any(Context.class)))
                                        .thenReturn("<html>Test</html>");
                        when(notificationService.createNotification(anyLong(), any(), any(), anyString(), anyString()))
                                        .thenReturn(mockNotification);

                        emailService.sendCancellation(
                                        "kunde@test.com", "Max", "Platz 1",
                                        ZonedDateTime.of(2026, 3, 1, 18, 0, 0, 0, AppConstants.VIENNA),
                                        "RES-ABC123", 100L);

                        verify(notificationService).createNotification(
                                        eq(100L), eq(NotificationType.EMAIL),
                                        eq(NotificationPurpose.CANCELLATION),
                                        eq("kunde@test.com"),
                                        argThat(subject -> subject.contains("Stornierung")
                                                        && subject.contains("RES-ABC123")));
                }
        }


        @Nested
        @DisplayName("Template-Kontext")
        class TemplateContextTests {

                @Test
                @DisplayName("Bestaetigungskontext enthaelt manageUrl mit baseUrl und confirmationCode")
                void confirmationContext_containsManageUrl() {
                        MimeMessage mimeMessage = mock(MimeMessage.class);
                        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

                        ArgumentCaptor<Context> contextCaptor = ArgumentCaptor.forClass(Context.class);
                        when(templateEngine.process(eq("email/confirmation"), contextCaptor.capture()))
                                        .thenReturn("<html>Test</html>");
                        when(notificationService.createNotification(anyLong(), any(), any(), anyString(), anyString()))
                                        .thenReturn(mockNotification);

                        emailService.sendConfirmation(
                                        "kunde@test.com", "Max", "Platz 1",
                                        ZonedDateTime.of(2026, 3, 1, 18, 0, 0, 0, AppConstants.VIENNA),
                                        ZonedDateTime.of(2026, 3, 1, 19, 0, 0, 0, AppConstants.VIENNA),
                                        60, new BigDecimal("50.00"), "RES-ABC123", 100L);

                        Context context = contextCaptor.getValue();
                        assertThat(context.getVariable("manageUrl"))
                                        .isEqualTo("https://halisaha.at/reservierung/verwalten/RES-ABC123");
                        assertThat(context.getVariable("customerName")).isEqualTo("Max");
                        assertThat(context.getVariable("fieldName")).isEqualTo("Platz 1");
                        assertThat(context.getVariable("confirmationCode")).isEqualTo("RES-ABC123");
                        assertThat(context.getVariable("totalPrice")).isEqualTo(new BigDecimal("50.00"));
                        assertThat(context.getVariable("durationMinutes")).isEqualTo(60);
                        assertThat(context.getVariable("date")).isEqualTo("01.03.2026");
                        assertThat(context.getVariable("startTime")).isEqualTo("18:00");
                        assertThat(context.getVariable("endTime")).isEqualTo("19:00");
                }

                @Test
                @DisplayName("Erinnerungskontext enthaelt korrekte Variablen")
                void reminderContext_containsCorrectVariables() {
                        MimeMessage mimeMessage = mock(MimeMessage.class);
                        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

                        ArgumentCaptor<Context> contextCaptor = ArgumentCaptor.forClass(Context.class);
                        when(templateEngine.process(eq("email/reminder"), contextCaptor.capture()))
                                        .thenReturn("<html>Test</html>");
                        when(notificationService.createNotification(anyLong(), any(), any(), anyString(), anyString()))
                                        .thenReturn(mockNotification);

                        emailService.sendReminder(
                                        "kunde@test.com", "Max", "Platz 2",
                                        ZonedDateTime.of(2026, 3, 15, 20, 0, 0, 0, AppConstants.VIENNA),
                                        ZonedDateTime.of(2026, 3, 15, 21, 30, 0, 0, AppConstants.VIENNA),
                                        "RES-DEF456", 200L);

                        Context context = contextCaptor.getValue();
                        assertThat(context.getVariable("customerName")).isEqualTo("Max");
                        assertThat(context.getVariable("fieldName")).isEqualTo("Platz 2");
                        assertThat(context.getVariable("date")).isEqualTo("15.03.2026");
                        assertThat(context.getVariable("startTime")).isEqualTo("20:00");
                        assertThat(context.getVariable("endTime")).isEqualTo("21:30");
                        assertThat(context.getVariable("confirmationCode")).isEqualTo("RES-DEF456");
                        assertThat(context.getVariable("manageUrl"))
                                        .isEqualTo("https://halisaha.at/reservierung/verwalten/RES-DEF456");
                }

                @Test
                @DisplayName("Stornierungskontext enthaelt korrekte Variablen")
                void cancellationContext_containsCorrectVariables() {
                        MimeMessage mimeMessage = mock(MimeMessage.class);
                        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

                        ArgumentCaptor<Context> contextCaptor = ArgumentCaptor.forClass(Context.class);
                        when(templateEngine.process(eq("email/cancellation"), contextCaptor.capture()))
                                        .thenReturn("<html>Test</html>");
                        when(notificationService.createNotification(anyLong(), any(), any(), anyString(), anyString()))
                                        .thenReturn(mockNotification);

                        emailService.sendCancellation(
                                        "kunde@test.com", "Max", "Platz 3",
                                        ZonedDateTime.of(2026, 4, 1, 10, 0, 0, 0, AppConstants.VIENNA),
                                        "RES-GHI789", 300L);

                        Context context = contextCaptor.getValue();
                        assertThat(context.getVariable("customerName")).isEqualTo("Max");
                        assertThat(context.getVariable("fieldName")).isEqualTo("Platz 3");
                        assertThat(context.getVariable("date")).isEqualTo("01.04.2026");
                        assertThat(context.getVariable("startTime")).isEqualTo("10:00");
                        assertThat(context.getVariable("confirmationCode")).isEqualTo("RES-GHI789");
                }
        }
}
