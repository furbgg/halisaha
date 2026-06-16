package com.halisaha.notification;

import com.halisaha.notification.entity.Notification;
import com.halisaha.notification.repository.NotificationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService — Benachrichtigungsverwaltung")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;


    @Nested
    @DisplayName("Benachrichtigung erstellen")
    class CreateNotificationTests {

        @Test
        @DisplayName("Erstellt Notification mit korrekten Feldern")
        void createNotification_setsAllFieldsCorrectly() {
            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            when(notificationRepository.save(captor.capture())).thenAnswer(inv -> {
                Notification n = inv.getArgument(0);
                n.setId(1L);
                return n;
            });

            notificationService.createNotification(
                    100L, NotificationType.EMAIL,
                    NotificationPurpose.CONFIRMATION,
                    "test@test.com", "Betreff");

            Notification saved = captor.getValue();
            assertThat(saved.getReservationId()).isEqualTo(100L);
            assertThat(saved.getType()).isEqualTo(NotificationType.EMAIL);
            assertThat(saved.getPurpose()).isEqualTo(NotificationPurpose.CONFIRMATION);
            assertThat(saved.getRecipient()).isEqualTo("test@test.com");
            assertThat(saved.getContent()).isEqualTo("Betreff");
            assertThat(saved.getStatus()).isEqualTo(NotificationStatus.PENDING);
        }

        @Test
        @DisplayName("Neue Notification hat Status PENDING")
        void createNotification_hasStatusPending() {
            when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            Notification result = notificationService.createNotification(
                    1L, NotificationType.EMAIL,
                    NotificationPurpose.REMINDER,
                    "test@test.com", "Test"
            );

            assertThat(result.getStatus()).isEqualTo(NotificationStatus.PENDING);
        }

        @Test
        @DisplayName("Repository.save wird aufgerufen")
        void createNotification_callsSave() {
            when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            notificationService.createNotification(
                    1L, NotificationType.SMS,
                    NotificationPurpose.CANCELLATION,
                    "+43123456", "Storniert"
            );

            verify(notificationRepository).save(any(Notification.class));
        }
    }


    @Nested
    @DisplayName("Als gesendet markieren")
    class MarkSentTests {

        @Test
        @DisplayName("Setzt Status auf SENT")
        void markSent_setsStatusToSent() {
            Notification notification = Notification.builder()
                    .id(1L)
                    .status(NotificationStatus.PENDING)
                    .build();

            when(notificationRepository.save(any())).thenReturn(notification);

            notificationService.markSent(notification);

            assertThat(notification.getStatus()).isEqualTo(NotificationStatus.SENT);
        }

        @Test
        @DisplayName("Setzt sentAt auf aktuelle Zeit")
        void markSent_setsSentAtTimestamp() {
            Notification notification = Notification.builder()
                    .id(1L)
                    .status(NotificationStatus.PENDING)
                    .build();

            when(notificationRepository.save(any())).thenReturn(notification);

            notificationService.markSent(notification);

            assertThat(notification.getSentAt()).isNotNull();
        }

        @Test
        @DisplayName("Speichert aktualisierte Notification")
        void markSent_savesNotification() {
            Notification notification = Notification.builder()
                    .id(1L)
                    .status(NotificationStatus.PENDING)
                    .build();

            when(notificationRepository.save(notification)).thenReturn(notification);

            notificationService.markSent(notification);

            verify(notificationRepository).save(notification);
        }
    }


    @Nested
    @DisplayName("Als fehlgeschlagen markieren")
    class MarkFailedTests {

        @Test
        @DisplayName("Setzt Status auf FAILED")
        void markFailed_setsStatusToFailed() {
            Notification notification = Notification.builder()
                    .id(1L)
                    .status(NotificationStatus.PENDING)
                    .build();

            when(notificationRepository.save(any())).thenReturn(notification);

            notificationService.markFailed(notification, "SMTP Timeout");

            assertThat(notification.getStatus()).isEqualTo(NotificationStatus.FAILED);
        }

        @Test
        @DisplayName("Setzt Fehlermeldung")
        void markFailed_setsErrorMessage() {
            Notification notification = Notification.builder()
                    .id(1L)
                    .status(NotificationStatus.PENDING)
                    .build();

            when(notificationRepository.save(any())).thenReturn(notification);

            notificationService.markFailed(notification, "Connection refused");

            assertThat(notification.getErrorMessage()).isEqualTo("Connection refused");
        }

        @Test
        @DisplayName("Speichert aktualisierte Notification")
        void markFailed_savesNotification() {
            Notification notification = Notification.builder()
                    .id(1L)
                    .status(NotificationStatus.PENDING)
                    .build();

            when(notificationRepository.save(notification)).thenReturn(notification);

            notificationService.markFailed(notification, "Error");

            verify(notificationRepository).save(notification);
        }
    }


    @Nested
    @DisplayName("Erinnerung bereits gesendet")
    class WasReminderAlreadySentTests {

        @Test
        @DisplayName("Gibt true zurueck wenn Erinnerung existiert")
        void wasReminderAlreadySent_withExistingReminder_returnsTrue() {
            Notification existingReminder = Notification.builder()
                    .id(1L)
                    .reservationId(100L)
                    .purpose(NotificationPurpose.REMINDER)
                    .build();

            when(notificationRepository.findByReservationIdAndPurpose(100L, NotificationPurpose.REMINDER))
                    .thenReturn(List.of(existingReminder));

            assertThat(notificationService.wasReminderAlreadySent(100L)).isTrue();
        }

        @Test
        @DisplayName("Gibt false zurueck wenn keine Erinnerung existiert")
        void wasReminderAlreadySent_noReminder_returnsFalse() {
            when(notificationRepository.findByReservationIdAndPurpose(200L, NotificationPurpose.REMINDER))
                    .thenReturn(Collections.emptyList());

            assertThat(notificationService.wasReminderAlreadySent(200L)).isFalse();
        }

        @Test
        @DisplayName("Andere Benachrichtigungstypen zaehlen nicht als Erinnerung")
        void wasReminderAlreadySent_otherPurposes_returnsFalse() {
            when(notificationRepository.findByReservationIdAndPurpose(300L, NotificationPurpose.REMINDER))
                    .thenReturn(Collections.emptyList());

            assertThat(notificationService.wasReminderAlreadySent(300L)).isFalse();
        }
    }
}
