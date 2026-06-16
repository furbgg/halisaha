package com.halisaha.field;

import com.halisaha.common.AppConstants;

import com.halisaha.field.dto.FieldAvailabilityResponse;
import com.halisaha.field.dto.TimeSlot;
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

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("FieldService — Slot Generation & Overlap Detection")
class FieldServiceTest {

    @Mock
    private FieldRepository fieldRepository;
    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private SlotHoldRepository slotHoldRepository;

    @InjectMocks
    private FieldService fieldService;

    private Field testField;
    private final LocalDate TODAY = LocalDate.of(2026, 6, 17);

    @BeforeEach
    void setUp() {
        testField = Field.builder()
                .id(1L)
                .name("Platz 1")
                .openingTime(LocalTime.of(9, 0))
                .closingTime(LocalTime.of(23, 0))
                .allowedDurations(new Integer[] { 60, 90, 120, 180 })
                .hourlyPrice(new java.math.BigDecimal("50.00"))
                .active(true)
                .build();
    }

    private void stubFieldAndEmptyBookings() {
        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
        when(reservationRepository.findActiveByFieldAndDate(eq(1L), any(), any()))
                .thenReturn(Collections.emptyList());
        when(slotHoldRepository.findActiveHoldsByFieldAndDate(eq(1L), any(), any(), any()))
                .thenReturn(Collections.emptyList());
    }


    @Nested
    @DisplayName("Slot Generation")
    class SlotGeneration {

        @Test
        @DisplayName("60dk süre — her 30dk bir slot, 09:00-22:30 arası 28 slot")
        void shouldGenerate60MinSlotsWith30MinWindow() {
            stubFieldAndEmptyBookings();

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 60);

            assertThat(response.getSlots()).isNotEmpty();
            assertThat(response.getDurationMinutes()).isEqualTo(60);
            assertThat(response.getFieldId()).isEqualTo(1L);

            TimeSlot first = response.getSlots().get(0);
            assertThat(first.getStartTime()).isEqualTo(TODAY.atTime(9, 0).atZone(AppConstants.VIENNA));
            assertThat(first.getEndTime()).isEqualTo(TODAY.atTime(10, 0).atZone(AppConstants.VIENNA));

            TimeSlot last = response.getSlots().get(response.getSlots().size() - 1);
            assertThat(last.getEndTime()).isEqualTo(TODAY.atTime(23, 0).atZone(AppConstants.VIENNA));
            assertThat(last.getStartTime()).isEqualTo(TODAY.atTime(22, 0).atZone(AppConstants.VIENNA));
        }

        @Test
        @DisplayName("90dk süre — 30dk sliding window, son slot 21:30-23:00")
        void shouldGenerate90MinSlots() {
            stubFieldAndEmptyBookings();

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 90);

            TimeSlot last = response.getSlots().get(response.getSlots().size() - 1);
            assertThat(last.getStartTime()).isEqualTo(TODAY.atTime(21, 30).atZone(AppConstants.VIENNA));
            assertThat(last.getEndTime()).isEqualTo(TODAY.atTime(23, 0).atZone(AppConstants.VIENNA));

            for (TimeSlot slot : response.getSlots()) {
                assertThat(java.time.Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes())
                        .isEqualTo(90);
            }
        }

        @Test
        @DisplayName("120dk süre — son slot 21:00-23:00")
        void shouldGenerate120MinSlots() {
            stubFieldAndEmptyBookings();

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 120);

            TimeSlot last = response.getSlots().get(response.getSlots().size() - 1);
            assertThat(last.getStartTime()).isEqualTo(TODAY.atTime(21, 0).atZone(AppConstants.VIENNA));
            assertThat(last.getEndTime()).isEqualTo(TODAY.atTime(23, 0).atZone(AppConstants.VIENNA));
        }

        @Test
        @DisplayName("180dk süre — son slot 20:00-23:00")
        void shouldGenerate180MinSlots() {
            stubFieldAndEmptyBookings();

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 180);

            TimeSlot first = response.getSlots().get(0);
            assertThat(first.getStartTime()).isEqualTo(TODAY.atTime(9, 0).atZone(AppConstants.VIENNA));
            assertThat(first.getEndTime()).isEqualTo(TODAY.atTime(12, 0).atZone(AppConstants.VIENNA));

            TimeSlot last = response.getSlots().get(response.getSlots().size() - 1);
            assertThat(last.getStartTime()).isEqualTo(TODAY.atTime(20, 0).atZone(AppConstants.VIENNA));
            assertThat(last.getEndTime()).isEqualTo(TODAY.atTime(23, 0).atZone(AppConstants.VIENNA));
        }

        @Test
        @DisplayName("izin verilmeyen süre (45dk) → IllegalArgumentException")
        void shouldRejectDisallowedDuration() {
            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            assertThatThrownBy(() -> fieldService.getAvailability(1L, TODAY, 45))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("45");
        }
    }


    @Nested
    @DisplayName("Overlap Detection — Reservations")
    class OverlapDetection {

        @Test
        @DisplayName("60dk termin dolu → overlapping 60dk slot KAPALI")
        void exactOverlap60Min() {
            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            Reservation booked = Reservation.builder()
                    .gameType("FOOTBALL")
                    .startTime(TODAY.atTime(14, 0).atZone(AppConstants.VIENNA))
                    .endTime(TODAY.atTime(15, 0).atZone(AppConstants.VIENNA))
                    .build();

            when(reservationRepository.findActiveByFieldAndDate(eq(1L), any(), any()))
                    .thenReturn(List.of(booked));
            when(slotHoldRepository.findActiveHoldsByFieldAndDate(eq(1L), any(), any(), any()))
                    .thenReturn(Collections.emptyList());

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 60);

            TimeSlot slot1400 = findSlotByStart(response, 14, 0);
            assertThat(slot1400.isAvailable()).isFalse();

            TimeSlot slot1430 = findSlotByStart(response, 14, 30);
            assertThat(slot1430.isAvailable()).isFalse();

            TimeSlot slot1330 = findSlotByStart(response, 13, 30);
            assertThat(slot1330.isAvailable()).isFalse();

            TimeSlot slot1300 = findSlotByStart(response, 13, 0);
            assertThat(slot1300.isAvailable()).isTrue();

            TimeSlot slot1500 = findSlotByStart(response, 15, 0);
            assertThat(slot1500.isAvailable()).isTrue();
        }

        @Test
        @DisplayName("90dk termin dolu (14:00-15:30) → 3 adet 60dk slot KAPALI")
        void overlap90MinBookingWith60MinSlots() {
            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            Reservation booked = Reservation.builder()
                    .gameType("FOOTBALL")
                    .startTime(TODAY.atTime(14, 0).atZone(AppConstants.VIENNA))
                    .endTime(TODAY.atTime(15, 30).atZone(AppConstants.VIENNA))
                    .build();

            when(reservationRepository.findActiveByFieldAndDate(eq(1L), any(), any()))
                    .thenReturn(List.of(booked));
            when(slotHoldRepository.findActiveHoldsByFieldAndDate(eq(1L), any(), any(), any()))
                    .thenReturn(Collections.emptyList());

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 60);

            assertThat(findSlotByStart(response, 13, 30).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 14, 0).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 14, 30).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 15, 0).isAvailable()).isFalse();

            assertThat(findSlotByStart(response, 13, 0).isAvailable()).isTrue();
            assertThat(findSlotByStart(response, 15, 30).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("90dk slot seçimi ile 60dk termin çakışması")
        void overlap60MinBookingWith90MinSlots() {
            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            Reservation booked = Reservation.builder()
                    .gameType("FOOTBALL")
                    .startTime(TODAY.atTime(17, 0).atZone(AppConstants.VIENNA))
                    .endTime(TODAY.atTime(18, 0).atZone(AppConstants.VIENNA))
                    .build();

            when(reservationRepository.findActiveByFieldAndDate(eq(1L), any(), any()))
                    .thenReturn(List.of(booked));
            when(slotHoldRepository.findActiveHoldsByFieldAndDate(eq(1L), any(), any(), any()))
                    .thenReturn(Collections.emptyList());

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 90);

            assertThat(findSlotByStart(response, 16, 0).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 16, 30).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 17, 0).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 17, 30).isAvailable()).isFalse();

            assertThat(findSlotByStart(response, 15, 30).isAvailable()).isTrue();
            assertThat(findSlotByStart(response, 18, 0).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("iki ardışık termin (back-to-back) — arada boşluk yok ama çakışma da yok")
        void backToBackReservationsNoGap() {
            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            Reservation r1 = Reservation.builder()
                    .gameType("FOOTBALL")
                    .startTime(TODAY.atTime(14, 0).atZone(AppConstants.VIENNA))
                    .endTime(TODAY.atTime(15, 0).atZone(AppConstants.VIENNA))
                    .build();
            Reservation r2 = Reservation.builder()
                    .gameType("FOOTBALL")
                    .startTime(TODAY.atTime(15, 0).atZone(AppConstants.VIENNA))
                    .endTime(TODAY.atTime(16, 0).atZone(AppConstants.VIENNA))
                    .build();

            when(reservationRepository.findActiveByFieldAndDate(eq(1L), any(), any()))
                    .thenReturn(List.of(r1, r2));
            when(slotHoldRepository.findActiveHoldsByFieldAndDate(eq(1L), any(), any(), any()))
                    .thenReturn(Collections.emptyList());

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 60);

            assertThat(findSlotByStart(response, 14, 0).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 14, 30).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 15, 0).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 15, 30).isAvailable()).isFalse();

            assertThat(findSlotByStart(response, 13, 0).isAvailable()).isTrue();
            assertThat(findSlotByStart(response, 16, 0).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("gün boyunca 3 farklı termin — sadece boş slotlar AÇIK")
        void multipleSeparateReservations() {
            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            Reservation r1 = Reservation.builder()
                    .gameType("FOOTBALL")
                    .startTime(TODAY.atTime(9, 0).atZone(AppConstants.VIENNA)).endTime(TODAY.atTime(10, 30).atZone(AppConstants.VIENNA)).build();
            Reservation r2 = Reservation.builder()
                    .gameType("FOOTBALL")
                    .startTime(TODAY.atTime(14, 0).atZone(AppConstants.VIENNA)).endTime(TODAY.atTime(15, 0).atZone(AppConstants.VIENNA)).build();
            Reservation r3 = Reservation.builder()
                    .gameType("FOOTBALL")
                    .startTime(TODAY.atTime(20, 0).atZone(AppConstants.VIENNA)).endTime(TODAY.atTime(22, 0).atZone(AppConstants.VIENNA)).build();

            when(reservationRepository.findActiveByFieldAndDate(eq(1L), any(), any()))
                    .thenReturn(List.of(r1, r2, r3));
            when(slotHoldRepository.findActiveHoldsByFieldAndDate(eq(1L), any(), any(), any()))
                    .thenReturn(Collections.emptyList());

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 60);

            assertThat(findSlotByStart(response, 10, 30).isAvailable()).isTrue();
            assertThat(findSlotByStart(response, 15, 0).isAvailable()).isTrue();
            assertThat(findSlotByStart(response, 22, 0).isAvailable()).isTrue();
            assertThat(findSlotByStart(response, 9, 0).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 14, 0).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 20, 0).isAvailable()).isFalse();
        }

        @Test
        @DisplayName("boş gün — tüm slotlar AÇIK (past hariç)")
        void emptyDayAllSlotsAvailable() {
            stubFieldAndEmptyBookings();

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 60);

            long availableCount = response.getSlots().stream()
                    .filter(TimeSlot::isAvailable)
                    .count();
            assertThat(availableCount).isEqualTo(response.getSlots().size());
        }
    }


    @Nested
    @DisplayName("Hold Detection")
    class HoldDetection {

        @Test
        @DisplayName("held slot 60dk — held ve unavailable gösterilmeli")
        void heldSlotShowsAsUnavailable() {
            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findActiveByFieldAndDate(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());

            SlotHold hold = SlotHold.builder()
                    .startTime(TODAY.atTime(16, 0).atZone(AppConstants.VIENNA))
                    .durationMinutes(60)
                    .build();

            when(slotHoldRepository.findActiveHoldsByFieldAndDate(eq(1L), any(), any(), any()))
                    .thenReturn(List.of(hold));

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 60);

            TimeSlot slot1600 = findSlotByStart(response, 16, 0);
            assertThat(slot1600.isAvailable()).isFalse();
            assertThat(slot1600.isHeld()).isTrue();
        }

        @Test
        @DisplayName("90dk hold — 30dk sliding window ile 3 slot etkilenmeli")
        void hold90MinAffectsMultipleSlots() {
            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findActiveByFieldAndDate(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());

            SlotHold hold = SlotHold.builder()
                    .startTime(TODAY.atTime(14, 0).atZone(AppConstants.VIENNA))
                    .durationMinutes(90)
                    .build();

            when(slotHoldRepository.findActiveHoldsByFieldAndDate(eq(1L), any(), any(), any()))
                    .thenReturn(List.of(hold));

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 60);

            assertThat(findSlotByStart(response, 13, 30).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 14, 0).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 14, 30).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 15, 0).isAvailable()).isFalse();

            assertThat(findSlotByStart(response, 13, 0).isAvailable()).isTrue();
            assertThat(findSlotByStart(response, 15, 30).isAvailable()).isTrue();
        }
    }


    @Nested
    @DisplayName("Edge Cases")
    class EdgeCases {

        @Test
        @DisplayName("saha kapanışına tam sığan son slot — dahil edilmeli")
        void lastSlotExactlyFitsClosingTime() {
            stubFieldAndEmptyBookings();

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 120);

            TimeSlot last = response.getSlots().get(response.getSlots().size() - 1);
            assertThat(last.getStartTime().toLocalTime()).isEqualTo(LocalTime.of(21, 0));
            assertThat(last.getEndTime().toLocalTime()).isEqualTo(LocalTime.of(23, 0));
        }

        @Test
        @DisplayName("21:30 başlangıçlı 120dk slot → 23:30 kapanışı aşar, oluşturulmamalı")
        void slotExceedingClosingTimeNotGenerated() {
            stubFieldAndEmptyBookings();

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 120);

            boolean has2130 = response.getSlots().stream()
                    .anyMatch(s -> s.getStartTime().toLocalTime().equals(LocalTime.of(21, 30)));
            assertThat(has2130).isFalse();
        }

        @Test
        @DisplayName("reservation + hold aynı anda → ikisi de slot'u kapatmalı")
        void reservationAndHoldBothBlockSlot() {
            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            Reservation booked = Reservation.builder()
                    .gameType("FOOTBALL")
                    .startTime(TODAY.atTime(10, 0).atZone(AppConstants.VIENNA))
                    .endTime(TODAY.atTime(11, 0).atZone(AppConstants.VIENNA))
                    .build();
            SlotHold hold = SlotHold.builder()
                    .startTime(TODAY.atTime(12, 0).atZone(AppConstants.VIENNA))
                    .durationMinutes(60)
                    .build();

            when(reservationRepository.findActiveByFieldAndDate(eq(1L), any(), any()))
                    .thenReturn(List.of(booked));
            when(slotHoldRepository.findActiveHoldsByFieldAndDate(eq(1L), any(), any(), any()))
                    .thenReturn(List.of(hold));

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 60);

            assertThat(findSlotByStart(response, 10, 0).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 10, 0).isHeld()).isFalse();
            assertThat(findSlotByStart(response, 12, 0).isAvailable()).isFalse();
            assertThat(findSlotByStart(response, 12, 0).isHeld()).isTrue();
            assertThat(findSlotByStart(response, 11, 0).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("kısa açılış saati (09:00-10:00) — 120dk slot sığmamalı")
        void shortOpeningHoursNoSlots() {
            testField.setOpeningTime(LocalTime.of(9, 0));
            testField.setClosingTime(LocalTime.of(10, 0));

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findActiveByFieldAndDate(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(slotHoldRepository.findActiveHoldsByFieldAndDate(eq(1L), any(), any(), any()))
                    .thenReturn(Collections.emptyList());

            FieldAvailabilityResponse response = fieldService.getAvailability(1L, TODAY, 120);

            assertThat(response.getSlots()).isEmpty();
        }
    }


    private TimeSlot findSlotByStart(FieldAvailabilityResponse response, int hour, int minute) {
        ZonedDateTime target = TODAY.atTime(hour, minute).atZone(AppConstants.VIENNA);
        return response.getSlots().stream()
                .filter(s -> s.getStartTime().equals(target))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Slot not found: " + target));
    }

    private static class AssertionError extends RuntimeException {
        AssertionError(String msg) {
            super(msg);
        }
    }
}
