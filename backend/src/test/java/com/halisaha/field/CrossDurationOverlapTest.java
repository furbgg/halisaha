package com.halisaha.field;

import com.halisaha.common.AppConstants;

import com.halisaha.field.dto.FieldAvailabilityResponse;
import com.halisaha.field.dto.TimeSlot;
import com.halisaha.field.entity.Field;
import com.halisaha.field.repository.FieldRepository;
import com.halisaha.reservation.entity.Reservation;
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

import java.time.Duration;
import java.time.LocalDate;

import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Derin çakışma testleri — her süre kombinasyonu için:
 * 
 * 60dk termin varken → hangi 60/90/120/180dk slotlar kapanır?
 * 90dk termin varken → hangi 60/90/120/180dk slotlar kapanır?
 * 120dk termin varken → hangi 60/90/120/180dk slotlar kapanır?
 * 180dk termin varken → hangi 60/90/120/180dk slotlar kapanır?
 * 
 * Boşluk analizi:
 * İki termin arasındaki boşluğa hangi süreler sığar?
 * Gün boyunca karma süreler — çakışma olmadan art arda
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Cross-Duration Overlap — Tüm Süre Kombinasyonları")
class CrossDurationOverlapTest {

    @Mock
    private FieldRepository fieldRepository;
    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private SlotHoldRepository slotHoldRepository;

    @InjectMocks
    private FieldService fieldService;

    private Field testField;
    private final LocalDate DAY = LocalDate.of(2026, 4, 10);

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

    private void stubField(List<Reservation> reservations) {
        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
        when(reservationRepository.findActiveByFieldAndDate(eq(1L), any(), any()))
                .thenReturn(reservations);
        when(slotHoldRepository.findActiveHoldsByFieldAndDate(eq(1L), any(), any(), any()))
                .thenReturn(Collections.emptyList());
    }

    private TimeSlot findSlot(FieldAvailabilityResponse r, int h, int m) {
        return r.getSlots().stream()
                .filter(s -> s.getStartTime().equals(DAY.atTime(h, m).atZone(AppConstants.VIENNA)))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Slot not found: " + h + ":" + m));
    }

    private Reservation booking(int startH, int startM, int endH, int endM) {
        return Reservation.builder()
                .gameType("FOOTBALL")
                .startTime(DAY.atTime(startH, startM).atZone(AppConstants.VIENNA))
                .endTime(DAY.atTime(endH, endM).atZone(AppConstants.VIENNA))
                .build();
    }


    @Nested
    @DisplayName("180dk (3 saat) termin varken")
    class With180MinBooking {

        private final Reservation threeHour = booking(14, 0, 17, 0);

        @Test
        @DisplayName("60dk slotlar: 13:00❌ 13:30❌ 14:00❌ 14:30❌ ... 16:30❌ 17:00✅")
        void blocks60MinSlots() {
            stubField(List.of(threeHour));
            FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, 60);

            assertThat(findSlot(res, 13, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 14, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 14, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 16, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 16, 30).isAvailable()).isFalse();

            assertThat(findSlot(res, 13, 0).isAvailable()).isTrue();
            assertThat(findSlot(res, 17, 0).isAvailable()).isTrue();
            assertThat(findSlot(res, 12, 0).isAvailable()).isTrue();
            assertThat(findSlot(res, 18, 0).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("90dk slotlar: 12:30❌ ... 16:00❌ | 12:00✅ 17:00✅")
        void blocks90MinSlots() {
            stubField(List.of(threeHour));
            FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, 90);

            assertThat(findSlot(res, 12, 30).isAvailable()).isTrue();

            assertThat(findSlot(res, 13, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 13, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 14, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 16, 0).isAvailable()).isFalse();

            assertThat(findSlot(res, 17, 0).isAvailable()).isTrue();
            assertThat(findSlot(res, 12, 0).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("120dk slotlar: 12:30❌ ... 16:00❌ | 12:00✅ 17:00✅")
        void blocks120MinSlots() {
            stubField(List.of(threeHour));
            FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, 120);

            assertThat(findSlot(res, 12, 0).isAvailable()).isTrue();

            assertThat(findSlot(res, 12, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 13, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 14, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 16, 0).isAvailable()).isFalse();

            assertThat(findSlot(res, 17, 0).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("180dk slotlar: kendi süresinde çakışma — 11:30❌ ... 15:00❌ | 11:00✅ 17:00✅")
        void blocks180MinSlots() {
            stubField(List.of(threeHour));
            FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, 180);

            assertThat(findSlot(res, 11, 0).isAvailable()).isTrue();
            assertThat(findSlot(res, 11, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 12, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 14, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 14, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 0).isAvailable()).isFalse();

            assertThat(findSlot(res, 17, 0).isAvailable()).isTrue();
        }
    }


    @Nested
    @DisplayName("120dk (2 saat) termin varken")
    class With120MinBooking {

        private final Reservation twoHour = booking(15, 0, 17, 0);

        @Test
        @DisplayName("60dk slotlar: 14:30❌ 15:00❌ 15:30❌ 16:00❌ 16:30❌ | 14:00✅ 17:00✅")
        void blocks60MinSlots() {
            stubField(List.of(twoHour));
            FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, 60);

            assertThat(findSlot(res, 14, 0).isAvailable()).isTrue();
            assertThat(findSlot(res, 14, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 16, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 16, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 17, 0).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("90dk slotlar: 13:30✅ 14:00❌ ... 16:00❌ | 13:30✅ 17:00✅")
        void blocks90MinSlots() {
            stubField(List.of(twoHour));
            FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, 90);

            assertThat(findSlot(res, 13, 30).isAvailable()).isTrue();
            assertThat(findSlot(res, 14, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 14, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 16, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 17, 0).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("180dk slotlar: 120dk termin çok sayıda 180dk slotu kapatır")
        void blocks180MinSlots() {
            stubField(List.of(twoHour));
            FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, 180);

            assertThat(findSlot(res, 12, 0).isAvailable()).isTrue();
            assertThat(findSlot(res, 12, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 13, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 14, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 14, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 0).isAvailable()).isFalse();

            assertThat(findSlot(res, 17, 0).isAvailable()).isTrue();
        }
    }


    @Nested
    @DisplayName("90dk (1.5 saat) termin varken")
    class With90MinBooking {

        private final Reservation ninetyMin = booking(14, 30, 16, 0);

        @Test
        @DisplayName("60dk slotlar: 14:00❌ 14:30❌ 15:00❌ 15:30❌ | 13:30✅ 16:00✅")
        void blocks60MinSlots() {
            stubField(List.of(ninetyMin));
            FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, 60);

            assertThat(findSlot(res, 13, 30).isAvailable()).isTrue();
            assertThat(findSlot(res, 14, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 14, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 16, 0).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("120dk slotlar: 13:00❌ ... 15:00❌ | 12:30✅ 16:00✅")
        void blocks120MinSlots() {
            stubField(List.of(ninetyMin));
            FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, 120);

            assertThat(findSlot(res, 12, 30).isAvailable()).isTrue();
            assertThat(findSlot(res, 13, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 13, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 14, 0).isAvailable()).isFalse();
            assertThat(findSlot(res, 14, 30).isAvailable()).isFalse();
            assertThat(findSlot(res, 15, 0).isAvailable()).isFalse();

            assertThat(findSlot(res, 16, 0).isAvailable()).isTrue();
        }
    }


    @Nested
    @DisplayName("Boşluk Analizi — iki termin arasına sığar mı?")
    class GapAnalysis {

        @Test
        @DisplayName("30dk boşluk (10:00-11:00 + 11:30-12:30) → 60dk slot sığmaz, 30dk'lık gap boş")
        void thirtyMinGapTooSmallFor60() {
            Reservation r1 = booking(10, 0, 11, 0);
            Reservation r2 = booking(11, 30, 12, 30);
            stubField(List.of(r1, r2));

            FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, 60);

            assertThat(findSlot(res, 11, 0).isAvailable()).isFalse();
        }

        @Test
        @DisplayName("60dk boşluk (10:00-11:00 + 12:00-13:00) → tam 60dk slot sığar")
        void sixtyMinGapExactlyFits60() {
            Reservation r1 = booking(10, 0, 11, 0);
            Reservation r2 = booking(12, 0, 13, 0);
            stubField(List.of(r1, r2));

            FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, 60);

            assertThat(findSlot(res, 11, 0).isAvailable()).isTrue();

            assertThat(findSlot(res, 11, 30).isAvailable()).isFalse();
        }

        @Test
        @DisplayName("90dk boşluk (10:00-11:00 + 12:30-14:00) → 60dk sığar, 90dk tam sığar, 120dk sığmaz")
        void ninetyMinGap() {
            Reservation r1 = booking(10, 0, 11, 0);
            Reservation r2 = booking(12, 30, 14, 0);
            stubField(List.of(r1, r2));

            FieldAvailabilityResponse res60 = fieldService.getAvailability(1L, DAY, 60);
            assertThat(findSlot(res60, 11, 0).isAvailable()).isTrue();
            assertThat(findSlot(res60, 11, 30).isAvailable()).isTrue();

            FieldAvailabilityResponse res90 = fieldService.getAvailability(1L, DAY, 90);
            assertThat(findSlot(res90, 11, 0).isAvailable()).isTrue();

            assertThat(findSlot(res90, 11, 30).isAvailable()).isFalse();

            FieldAvailabilityResponse res120 = fieldService.getAvailability(1L, DAY, 120);
            assertThat(findSlot(res120, 11, 0).isAvailable()).isFalse();
        }

        @Test
        @DisplayName("2 saat boşluk (09:00-11:00 + 13:00-15:00) → 120dk tam sığar, 180dk sığmaz")
        void twoHourGap() {
            Reservation r1 = booking(9, 0, 11, 0);
            Reservation r2 = booking(13, 0, 15, 0);
            stubField(List.of(r1, r2));

            FieldAvailabilityResponse res120 = fieldService.getAvailability(1L, DAY, 120);
            assertThat(findSlot(res120, 11, 0).isAvailable()).isTrue();

            assertThat(findSlot(res120, 11, 30).isAvailable()).isFalse();

            FieldAvailabilityResponse res180 = fieldService.getAvailability(1L, DAY, 180);
            assertThat(findSlot(res180, 11, 0).isAvailable()).isFalse();
        }
    }


    @Nested
    @DisplayName("Gün Boyunca Karma Süreler")
    class MixedDurationDay {

        @Test
        @DisplayName("180dk + 90dk + 60dk → kalan slotlar doğru hesaplanmalı")
        void fullDayMixed() {
            Reservation r1 = booking(9, 0, 12, 0);
            Reservation r2 = booking(13, 0, 14, 30);
            Reservation r3 = booking(16, 0, 17, 0);
            stubField(List.of(r1, r2, r3));

            FieldAvailabilityResponse res60 = fieldService.getAvailability(1L, DAY, 60);

            assertThat(findSlot(res60, 12, 0).isAvailable()).isTrue();
            assertThat(findSlot(res60, 12, 30).isAvailable()).isFalse();
            assertThat(findSlot(res60, 14, 30).isAvailable()).isTrue();
            assertThat(findSlot(res60, 15, 0).isAvailable()).isTrue();
            assertThat(findSlot(res60, 15, 30).isAvailable()).isFalse();
            assertThat(findSlot(res60, 17, 0).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("dolu gün — 4×180dk = 09:00-21:00 dolu, sadece 21:00-23:00 açık")
        void fourThreeHourBlocksFullDay() {
            Reservation r1 = booking(9, 0, 12, 0);
            Reservation r2 = booking(12, 0, 15, 0);
            Reservation r3 = booking(15, 0, 18, 0);
            Reservation r4 = booking(18, 0, 21, 0);
            stubField(List.of(r1, r2, r3, r4));

            FieldAvailabilityResponse res60 = fieldService.getAvailability(1L, DAY, 60);
            long available60 = res60.getSlots().stream().filter(TimeSlot::isAvailable).count();
            assertThat(available60).isEqualTo(3);

            FieldAvailabilityResponse res120 = fieldService.getAvailability(1L, DAY, 120);
            long available120 = res120.getSlots().stream().filter(TimeSlot::isAvailable).count();
            assertThat(available120).isEqualTo(1);

            FieldAvailabilityResponse res180 = fieldService.getAvailability(1L, DAY, 180);
            long available180 = res180.getSlots().stream().filter(TimeSlot::isAvailable).count();
            assertThat(available180).isEqualTo(0);
        }

        @Test
        @DisplayName("90dk + 90dk back-to-back (14:00-15:30 + 15:30-17:00) → 60dk slot 15:00-16:00 KAPALI")
        void twoNinetyMinBackToBack() {
            Reservation r1 = booking(14, 0, 15, 30);
            Reservation r2 = booking(15, 30, 17, 0);
            stubField(List.of(r1, r2));

            FieldAvailabilityResponse res60 = fieldService.getAvailability(1L, DAY, 60);

            assertThat(findSlot(res60, 13, 0).isAvailable()).isTrue();
            assertThat(findSlot(res60, 13, 30).isAvailable()).isFalse();
            assertThat(findSlot(res60, 15, 0).isAvailable()).isFalse();
            assertThat(findSlot(res60, 17, 0).isAvailable()).isTrue();
        }
    }


    @Nested
    @DisplayName("Açılış/Kapanış Sınır Durumları")
    class OpeningClosingBoundary {

        @Test
        @DisplayName("ilk slot 09:00 (açılış) dolu → 09:30 etkili, 10:00 farklı sürelere göre")
        void firstSlotBooked() {
            Reservation firstSlot = booking(9, 0, 10, 0);
            stubField(List.of(firstSlot));

            FieldAvailabilityResponse res60 = fieldService.getAvailability(1L, DAY, 60);
            assertThat(findSlot(res60, 9, 0).isAvailable()).isFalse();
            assertThat(findSlot(res60, 9, 30).isAvailable()).isFalse();
            assertThat(findSlot(res60, 10, 0).isAvailable()).isTrue();

            FieldAvailabilityResponse res90 = fieldService.getAvailability(1L, DAY, 90);
            assertThat(findSlot(res90, 9, 0).isAvailable()).isFalse();
            assertThat(findSlot(res90, 9, 30).isAvailable()).isFalse();
            assertThat(findSlot(res90, 10, 0).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("son slot dolu (22:00-23:00) → önceki slotlar etkilenir")
        void lastSlotBooked() {
            Reservation lastSlot = booking(22, 0, 23, 0);
            stubField(List.of(lastSlot));

            FieldAvailabilityResponse res60 = fieldService.getAvailability(1L, DAY, 60);
            assertThat(findSlot(res60, 22, 0).isAvailable()).isFalse();
            assertThat(findSlot(res60, 21, 30).isAvailable()).isFalse();
            assertThat(findSlot(res60, 21, 0).isAvailable()).isTrue();

            FieldAvailabilityResponse res120 = fieldService.getAvailability(1L, DAY, 120);
            assertThat(findSlot(res120, 21, 0).isAvailable()).isFalse();
            assertThat(findSlot(res120, 20, 0).isAvailable()).isTrue();
        }

        @Test
        @DisplayName("açılış → 180dk (09:00-12:00) + kapanış ← 180dk (20:00-23:00) → orta slotlar açık")
        void bookingsAtBothEnds() {
            Reservation morning = booking(9, 0, 12, 0);
            Reservation evening = booking(20, 0, 23, 0);
            stubField(List.of(morning, evening));

            FieldAvailabilityResponse res60 = fieldService.getAvailability(1L, DAY, 60);

            assertThat(findSlot(res60, 12, 0).isAvailable()).isTrue();
            assertThat(findSlot(res60, 15, 0).isAvailable()).isTrue();
            assertThat(findSlot(res60, 19, 0).isAvailable()).isTrue();
            assertThat(findSlot(res60, 19, 30).isAvailable()).isFalse();

            FieldAvailabilityResponse res180 = fieldService.getAvailability(1L, DAY, 180);
            assertThat(findSlot(res180, 12, 0).isAvailable()).isTrue();
            assertThat(findSlot(res180, 17, 0).isAvailable()).isTrue();
            assertThat(findSlot(res180, 17, 30).isAvailable()).isFalse();
        }
    }


    @Nested
    @DisplayName("Slot Sayısı Doğruluğu")
    class SlotCountAccuracy {

        @Test
        @DisplayName("boş gün — doğru slot sayısı: 60dk=27, 90dk=26, 120dk=25, 180dk=23")
        void emptyDaySlotCounts() {
            stubField(Collections.emptyList());

            FieldAvailabilityResponse res60 = fieldService.getAvailability(1L, DAY, 60);
            assertThat(res60.getSlots()).hasSize(27);

            FieldAvailabilityResponse res90 = fieldService.getAvailability(1L, DAY, 90);
            assertThat(res90.getSlots()).hasSize(26);

            FieldAvailabilityResponse res120 = fieldService.getAvailability(1L, DAY, 120);
            assertThat(res120.getSlots()).hasSize(25);

            FieldAvailabilityResponse res180 = fieldService.getAvailability(1L, DAY, 180);
            assertThat(res180.getSlots()).hasSize(23);
        }

        @Test
        @DisplayName("her slot'un süresi durationMinutes ile eşleşmeli")
        void allSlotDurationsCorrect() {
            stubField(Collections.emptyList());

            for (int duration : new int[] { 60, 90, 120, 180 }) {
                FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, duration);
                for (TimeSlot slot : res.getSlots()) {
                    long actualMinutes = Duration.between(slot.getStartTime(), slot.getEndTime()).toMinutes();
                    assertThat(actualMinutes)
                            .as("Slot %s should be %ddk", slot.getStartTime(), duration)
                            .isEqualTo(duration);
                }
            }
        }

        @Test
        @DisplayName("hiçbir slot kapanış saatini aşmamalı")
        void noSlotExceedsClosingTime() {
            stubField(Collections.emptyList());

            for (int duration : new int[] { 60, 90, 120, 180 }) {
                FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, duration);
                for (TimeSlot slot : res.getSlots()) {
                    assertThat(slot.getEndTime().toLocalTime())
                            .as("Slot ending at %s should not exceed 23:00", slot.getEndTime())
                            .isBeforeOrEqualTo(LocalTime.of(23, 0));
                }
            }
        }

        @Test
        @DisplayName("hiçbir slot açılış saatinden önce başlamamalı")
        void noSlotBeforeOpeningTime() {
            stubField(Collections.emptyList());

            for (int duration : new int[] { 60, 90, 120, 180 }) {
                FieldAvailabilityResponse res = fieldService.getAvailability(1L, DAY, duration);
                for (TimeSlot slot : res.getSlots()) {
                    assertThat(slot.getStartTime().toLocalTime())
                            .as("Slot starting at %s should not be before 09:00", slot.getStartTime())
                            .isAfterOrEqualTo(LocalTime.of(9, 0));
                }
            }
        }
    }
}
