package com.halisaha.reservation;

import com.halisaha.common.AppConstants;

import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.common.exception.SlotAlreadyBookedException;
import com.halisaha.common.service.AppSettingsService;
import com.halisaha.field.entity.Field;
import com.halisaha.field.repository.FieldRepository;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.entity.SlotHold;
import com.halisaha.reservation.repository.ReservationRepository;
import com.halisaha.reservation.repository.SlotHoldRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SlotHoldService — Hold Creation, Conflict, Release")
class SlotHoldServiceTest {

        @Mock
        private SlotHoldRepository slotHoldRepository;
        @Mock
        private ReservationRepository reservationRepository;
        @Mock
        private FieldRepository fieldRepository;
        @Mock
        private AppSettingsService appSettingsService;

        @InjectMocks
        private SlotHoldService slotHoldService;

        private Field testField;

        @BeforeEach
        void setUp() {
                testField = Field.builder()
                                .id(1L)
                                .name("Platz 1")
                                .supportedSports(new String[]{"FOOTBALL"})
                                .openingTime(LocalTime.of(9, 0))
                                .closingTime(LocalTime.of(23, 0))
                                .allowedDurations(new Integer[] { 60, 90, 120, 180 })
                                .hourlyPrice(new BigDecimal("50.00"))
                                .active(true)
                                .build();
        }


        @Nested
        @DisplayName("Hold Creation — Success")
        class HoldCreationSuccess {

                @Test
                @DisplayName("başarılı hold — 60dk, doğru alanlar")
                void createHold60Min() {
                        ZonedDateTime startTime = ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA);

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(Collections.emptyList());
                        when(slotHoldRepository.findActiveHoldsInRange(eq(1L), eq(startTime), any(), any()))
                                        .thenReturn(Collections.emptyList());
                        when(appSettingsService.getInt("hold_duration_minutes", 5)).thenReturn(5);
                        when(slotHoldRepository.save(any())).thenAnswer(i -> {
                                SlotHold h = i.getArgument(0);
                                h.setId(1L);
                                return h;
                        });

                        SlotHold hold = slotHoldService.createHold(1L, startTime, 60, "session-abc");

                        assertThat(hold.getDurationMinutes()).isEqualTo(60);
                        assertThat(hold.getField()).isEqualTo(testField);
                        assertThat(hold.getSessionId()).isEqualTo("session-abc");
                }

                @Test
                @DisplayName("90dk hold — range-based conflict check")
                void createHold90Min() {
                        ZonedDateTime startTime = ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA);

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(reservationRepository.findConflictingReservations(eq(1L), eq(startTime),
                                        eq(startTime.plusMinutes(90))))
                                        .thenReturn(Collections.emptyList());
                        when(slotHoldRepository.findActiveHoldsInRange(eq(1L), eq(startTime), any(), any()))
                                        .thenReturn(Collections.emptyList());
                        when(appSettingsService.getInt("hold_duration_minutes", 5)).thenReturn(5);
                        when(slotHoldRepository.save(any())).thenAnswer(i -> {
                                SlotHold h = i.getArgument(0);
                                h.setId(2L);
                                return h;
                        });

                        SlotHold hold = slotHoldService.createHold(1L, startTime, 90, "session-xyz");

                        verify(reservationRepository).findConflictingReservations(
                                        1L, startTime, startTime.plusMinutes(90));
                        assertThat(hold.getDurationMinutes()).isEqualTo(90);
                }

                @Test
                @DisplayName("aynı session tekrar hold → mevcut hold yeniden oluşturulabilir")
                void sameSessionCanRenewHold() {
                        ZonedDateTime startTime = ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA);
                        SlotHold existingHold = SlotHold.builder()
                                        .id(5L)
                                        .sessionId("session-abc")
                                        .startTime(startTime)
                                        .build();

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(Collections.emptyList());
                        when(slotHoldRepository.findActiveHoldsInRange(eq(1L), eq(startTime), any(), any()))
                                        .thenReturn(List.of(existingHold));
                        when(appSettingsService.getInt("hold_duration_minutes", 5)).thenReturn(5);
                        when(slotHoldRepository.save(any())).thenAnswer(i -> i.getArgument(0));

                        SlotHold hold = slotHoldService.createHold(1L, startTime, 60, "session-abc");
                        assertThat(hold).isNotNull();
                }
        }


        @Nested
        @DisplayName("Hold Creation — Conflicts")
        class HoldCreationConflicts {

                @Test
                @DisplayName("slot zaten reserved → SlotAlreadyBookedException")
                void holdOnReservedSlot() {
                        ZonedDateTime startTime = ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA);

                        Reservation existing = Reservation.builder()
                                .gameType("FOOTBALL")
                                        .id(10L)
                                        .startTime(startTime)
                                        .endTime(startTime.plusMinutes(60))
                                        .build();

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(List.of(existing));

                        assertThatThrownBy(() -> slotHoldService.createHold(
                                        1L, startTime, 60, "session-new"))
                                        .isInstanceOf(SlotAlreadyBookedException.class)
                                        .hasMessageContaining("bereits gebucht");
                }

                @Test
                @DisplayName("farklı session zaten hold yapıyor → SlotAlreadyBookedException")
                void holdByDifferentSession() {
                        ZonedDateTime startTime = ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA);
                        SlotHold otherHold = SlotHold.builder()
                                        .id(5L)
                                        .sessionId("session-other")
                                        .startTime(startTime)
                                        .build();

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(Collections.emptyList());
                        when(slotHoldRepository.findActiveHoldsInRange(eq(1L), eq(startTime), any(), any()))
                                        .thenReturn(List.of(otherHold));

                        assertThatThrownBy(() -> slotHoldService.createHold(
                                        1L, startTime, 60, "session-mine"))
                                        .isInstanceOf(SlotAlreadyBookedException.class)
                                        .hasMessageContaining("gerade");
                }

        @Test
        @DisplayName("olmayan saha → ResourceNotFoundException")
        void holdFieldNotFound() {
            when(fieldRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> slotHoldService.createHold(
                    99L, ZonedDateTime.now(AppConstants.VIENNA), 60, "session-x"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
        }


        @Nested
        @DisplayName("Hold Release")
        class HoldRelease {

                @Test
                @DisplayName("session ID ile hold serbest bırakma")
                void releaseBySessionId() {
                        slotHoldService.releaseHold("session-abc");

                        verify(slotHoldRepository).deleteBySessionId("session-abc");
                }
        }


        @Nested
        @DisplayName("Hold Duration Settings")
        class HoldDurationSettings {

                @Test
                @DisplayName("hold süresi AppSettings'ten okunur (5dk default)")
                void holdDurationFromSettings() {
                        ZonedDateTime startTime = ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA);

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(Collections.emptyList());
                        when(slotHoldRepository.findActiveHoldsInRange(eq(1L), eq(startTime), any(), any()))
                                        .thenReturn(Collections.emptyList());
                        when(appSettingsService.getInt("hold_duration_minutes", 5)).thenReturn(10);
                        when(slotHoldRepository.save(any())).thenAnswer(i -> i.getArgument(0));

                        SlotHold hold = slotHoldService.createHold(1L, startTime, 60, "s1");

                        assertThat(hold.getExpiresAt()).isAfter(ZonedDateTime.now(AppConstants.VIENNA));
                }
        }
}
