package com.halisaha.notification;

import com.halisaha.common.AppConstants;

import com.halisaha.common.service.AppSettingsService;
import com.halisaha.field.entity.Field;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.repository.ReservationRepository;
import com.halisaha.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReminderScheduler — Hatirlatma Zamanlayici")
class ReminderSchedulerTest {

    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AppSettingsService appSettingsService;

    @InjectMocks
    private ReminderScheduler reminderScheduler;

    private Field testField;
    private User testUser;

    @BeforeEach
    void setUp() {
        testField = Field.builder()
                .id(1L)
                .name("Platz 1")
                .build();

        testUser = User.builder()
                .id(1L)
                .name("Max Mustermann")
                .email("max@example.com")
                .build();
    }


    @Nested
    @DisplayName("sendReminders")
    class SendRemindersTests {

        @Test
        @DisplayName("Yaklasan rezervasyona hatirlatma gonderir")
        void sendReminders_sendsToUpcomingReservation() {
            Reservation reservation = Reservation.builder()
                    .gameType("FOOTBALL")
                    .id(1L)
                    .confirmationCode("RES-001")
                    .user(testUser)
                    .field(testField)
                    .startTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(55))
                    .endTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(115))
                    .build();

            when(appSettingsService.getInt("reminder_hours_before", 1)).thenReturn(1);
            when(reservationRepository.findUpcomingForReminder(any(), any()))
                    .thenReturn(List.of(reservation));
            when(notificationService.wasReminderAlreadySent(1L)).thenReturn(false);

            reminderScheduler.sendReminders();

            verify(emailService).sendReminder(
                    eq("max@example.com"),
                    eq("Max Mustermann"),
                    eq("Platz 1"),
                    eq(reservation.getStartTime()),
                    eq(reservation.getEndTime()),
                    eq("RES-001"),
                    eq(1L));
        }

        @Test
        @DisplayName("Zaten gonderilmis hatirlatma — atlanir")
        void sendReminders_alreadySent_skipsReservation() {
            Reservation reservation = Reservation.builder()
                    .gameType("FOOTBALL")
                    .id(1L)
                    .confirmationCode("RES-001")
                    .user(testUser)
                    .field(testField)
                    .startTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(55))
                    .endTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(115))
                    .build();

            when(appSettingsService.getInt("reminder_hours_before", 1)).thenReturn(1);
            when(reservationRepository.findUpcomingForReminder(any(), any()))
                    .thenReturn(List.of(reservation));
            when(notificationService.wasReminderAlreadySent(1L)).thenReturn(true);

            reminderScheduler.sendReminders();

            verify(emailService, never()).sendReminder(any(), any(), any(), any(), any(), any(), any());
        }

        @Test
        @DisplayName("Guest email kullanilir — user yoksa")
        void sendReminders_guestReservation_usesGuestEmail() {
            Reservation reservation = Reservation.builder()
                    .gameType("FOOTBALL")
                    .id(2L)
                    .confirmationCode("RES-002")
                    .user(null)
                    .guestEmail("guest@example.com")
                    .guestName("Guest Name")
                    .field(testField)
                    .startTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(55))
                    .endTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(115))
                    .build();

            when(appSettingsService.getInt("reminder_hours_before", 1)).thenReturn(1);
            when(reservationRepository.findUpcomingForReminder(any(), any()))
                    .thenReturn(List.of(reservation));
            when(notificationService.wasReminderAlreadySent(2L)).thenReturn(false);

            reminderScheduler.sendReminders();

            verify(emailService).sendReminder(
                    eq("guest@example.com"),
                    eq("Guest Name"),
                    eq("Platz 1"),
                    any(), any(),
                    eq("RES-002"),
                    eq(2L));
        }

        @Test
        @DisplayName("Email bos — hatirlatma atlanir")
        void sendReminders_noEmail_skipsReservation() {
            Reservation reservation = Reservation.builder()
                    .gameType("FOOTBALL")
                    .id(3L)
                    .confirmationCode("RES-003")
                    .user(null)
                    .guestEmail(null)
                    .field(testField)
                    .startTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(55))
                    .endTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(115))
                    .build();

            when(appSettingsService.getInt("reminder_hours_before", 1)).thenReturn(1);
            when(reservationRepository.findUpcomingForReminder(any(), any()))
                    .thenReturn(List.of(reservation));
            when(notificationService.wasReminderAlreadySent(3L)).thenReturn(false);

            reminderScheduler.sendReminders();

            verify(emailService, never()).sendReminder(any(), any(), any(), any(), any(), any(), any());
        }

        @Test
        @DisplayName("Email servisi hatasi — diger rezervasyonlar etkilenmez")
        void sendReminders_emailError_continuesWithOthers() {
            Reservation r1 = Reservation.builder()
                    .gameType("FOOTBALL")
                    .id(1L).confirmationCode("RES-001")
                    .user(testUser).field(testField)
                    .startTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(55))
                    .endTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(115))
                    .build();

            User user2 = User.builder().id(2L).name("Anna").email("anna@test.com").build();
            Reservation r2 = Reservation.builder()
                    .gameType("FOOTBALL")
                    .id(2L).confirmationCode("RES-002")
                    .user(user2).field(testField)
                    .startTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(55))
                    .endTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(115))
                    .build();

            when(appSettingsService.getInt("reminder_hours_before", 1)).thenReturn(1);
            when(reservationRepository.findUpcomingForReminder(any(), any()))
                    .thenReturn(List.of(r1, r2));
            when(notificationService.wasReminderAlreadySent(anyLong())).thenReturn(false);

            doThrow(new RuntimeException("SMTP error"))
                    .when(emailService).sendReminder(eq("max@example.com"), any(), any(), any(), any(), any(), any());

            reminderScheduler.sendReminders();

            verify(emailService).sendReminder(eq("max@example.com"), any(), any(), any(), any(), any(), any());
            verify(emailService).sendReminder(eq("anna@test.com"), any(), any(), any(), any(), any(), any());
        }

        @Test
        @DisplayName("Bos liste — hicbir sey gonderilmez")
        void sendReminders_noUpcoming_sendsNothing() {
            when(appSettingsService.getInt("reminder_hours_before", 1)).thenReturn(1);
            when(reservationRepository.findUpcomingForReminder(any(), any()))
                    .thenReturn(Collections.emptyList());

            reminderScheduler.sendReminders();

            verify(emailService, never()).sendReminder(any(), any(), any(), any(), any(), any(), any());
        }

        @Test
        @DisplayName("Yapilandirmadan farkli hatirlatma suresi okunur")
        void sendReminders_customReminderHours() {
            when(appSettingsService.getInt("reminder_hours_before", 1)).thenReturn(3);
            when(reservationRepository.findUpcomingForReminder(any(), any()))
                    .thenReturn(Collections.emptyList());

            reminderScheduler.sendReminders();

            verify(appSettingsService).getInt("reminder_hours_before", 1);
        }
    }
}
