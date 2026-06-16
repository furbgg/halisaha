package com.halisaha.repository;

import com.halisaha.common.AppConstants;

import com.halisaha.RepositoryTestBase;
import com.halisaha.field.entity.Field;
import com.halisaha.field.repository.FieldRepository;
import com.halisaha.payment.ReservationPaymentStatus;
import com.halisaha.reservation.ReservationStatus;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("ReservationRepository — H2 Repository Tests")
class ReservationRepositoryTest extends RepositoryTestBase {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private FieldRepository fieldRepository;

    private Field testField;

    @BeforeEach
    void setUp() {
        reservationRepository.deleteAll();
        fieldRepository.deleteAll();

        testField = fieldRepository.save(Field.builder()
                .name("Platz 1")
                .supportedSports(new String[]{"FOOTBALL"})
                .hourlyPrice(new BigDecimal("80.00"))
                .allowedDurations(new Integer[] { 60, 90, 120 })
                .openingTime(LocalTime.of(9, 0))
                .closingTime(LocalTime.of(23, 0))
                .active(true)
                .build());
    }

    private Reservation createReservation(String code, ZonedDateTime start, int durationMinutes,
            ReservationStatus status, ReservationPaymentStatus paymentStatus) {
        return reservationRepository.save(Reservation.builder()
                .confirmationCode(code)
                .field(testField)
                .gameType("FOOTBALL")
                .startTime(start)
                .endTime(start.plusMinutes(durationMinutes))
                .durationMinutes(durationMinutes)
                .totalPrice(new BigDecimal("80.00"))
                .status(status)
                .paymentStatus(paymentStatus)
                .privacyAccepted(true)
                .guestName("Test Guest")
                .guestEmail("test@example.com")
                .build());
    }


    @Nested
    @DisplayName("findByDateRange")
    class FindByDateRangeTests {

        @Test
        @DisplayName("Tarih araligindaki rezervasyonlari bulur")
        void findByDateRange_returnsMatchingReservations() {
            ZonedDateTime march15 = ZonedDateTime.of(2026, 3, 15, 18, 0, 0, 0, AppConstants.VIENNA);
            ZonedDateTime march16 = ZonedDateTime.of(2026, 3, 16, 18, 0, 0, 0, AppConstants.VIENNA);

            createReservation("RES-001", march15, 60, ReservationStatus.CONFIRMED, ReservationPaymentStatus.PAID);
            createReservation("RES-002", march16, 60, ReservationStatus.CONFIRMED, ReservationPaymentStatus.PAID);

            ZonedDateTime from = ZonedDateTime.of(2026, 3, 15, 0, 0, 0, 0, AppConstants.VIENNA);
            ZonedDateTime to = ZonedDateTime.of(2026, 3, 16, 0, 0, 0, 0, AppConstants.VIENNA);

            List<Reservation> results = reservationRepository.findByDateRange(from, to);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getConfirmationCode()).isEqualTo("RES-001");
        }

        @Test
        @DisplayName("Bos tarih araligi — bos liste doner")
        void findByDateRange_noResults_returnsEmpty() {
            ZonedDateTime from = ZonedDateTime.of(2026, 1, 1, 0, 0, 0, 0, AppConstants.VIENNA);
            ZonedDateTime to = ZonedDateTime.of(2026, 1, 2, 0, 0, 0, 0, AppConstants.VIENNA);

            List<Reservation> results = reservationRepository.findByDateRange(from, to);

            assertThat(results).isEmpty();
        }
    }


    @Nested
    @DisplayName("findByConfirmationCode")
    class FindByConfirmationCodeTests {

        @Test
        @DisplayName("Var olan kod ile rezervasyon bulunur")
        void findByConfirmationCode_existingCode_returnsReservation() {
            createReservation("RES-UNIQUE", ZonedDateTime.of(2026, 4, 1, 18, 0, 0, 0, AppConstants.VIENNA),
                    60, ReservationStatus.CONFIRMED, ReservationPaymentStatus.PENDING);

            var result = reservationRepository.findByConfirmationCode("RES-UNIQUE");

            assertThat(result).isPresent();
            assertThat(result.get().getConfirmationCode()).isEqualTo("RES-UNIQUE");
        }

        @Test
        @DisplayName("Olmayan kod — empty doner")
        void findByConfirmationCode_nonExistingCode_returnsEmpty() {
            var result = reservationRepository.findByConfirmationCode("NON-EXISTENT");

            assertThat(result).isEmpty();
        }
    }


    @Nested
    @DisplayName("findUpcomingForReminder")
    class FindUpcomingForReminderTests {

        @Test
        @DisplayName("Hatirlatma icin uygun rezervasyonlari bulur")
        void findUpcomingForReminder_returnsEligible() {
            ZonedDateTime upcoming = ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(55);
            reservationRepository.save(Reservation.builder()
                    .gameType("FOOTBALL")
                    .confirmationCode("RES-REMIND")
                    .field(testField)
                    .startTime(upcoming)
                    .endTime(upcoming.plusHours(1))
                    .durationMinutes(60)
                    .totalPrice(new BigDecimal("80.00"))
                    .status(ReservationStatus.CONFIRMED)
                    .paymentStatus(ReservationPaymentStatus.PAID)
                    .privacyAccepted(true)
                    .notificationConsent(true)
                    .guestName("Test")
                    .guestEmail("test@test.com")
                    .build());

            ZonedDateTime from = ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(40);
            ZonedDateTime to = ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(70);

            List<Reservation> results = reservationRepository.findUpcomingForReminder(from, to);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getConfirmationCode()).isEqualTo("RES-REMIND");
        }

        @Test
        @DisplayName("notificationConsent=false olan filtre edilir")
        void findUpcomingForReminder_noConsent_excluded() {
            ZonedDateTime upcoming = ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(55);
            reservationRepository.save(Reservation.builder()
                    .gameType("FOOTBALL")
                    .confirmationCode("RES-NOCONSENT")
                    .field(testField)
                    .startTime(upcoming)
                    .endTime(upcoming.plusHours(1))
                    .durationMinutes(60)
                    .totalPrice(new BigDecimal("80.00"))
                    .status(ReservationStatus.CONFIRMED)
                    .paymentStatus(ReservationPaymentStatus.PAID)
                    .privacyAccepted(true)
                    .notificationConsent(false)
                    .guestName("Test")
                    .guestEmail("test@test.com")
                    .build());

            ZonedDateTime from = ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(40);
            ZonedDateTime to = ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(70);

            List<Reservation> results = reservationRepository.findUpcomingForReminder(from, to);

            assertThat(results).isEmpty();
        }

        @Test
        @DisplayName("Iptal edilmis rezervasyonlar filtre edilir")
        void findUpcomingForReminder_cancelled_excluded() {
            ZonedDateTime upcoming = ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(55);
            reservationRepository.save(Reservation.builder()
                    .gameType("FOOTBALL")
                    .confirmationCode("RES-CANCEL")
                    .field(testField)
                    .startTime(upcoming)
                    .endTime(upcoming.plusHours(1))
                    .durationMinutes(60)
                    .totalPrice(new BigDecimal("80.00"))
                    .status(ReservationStatus.CANCELLED)
                    .paymentStatus(ReservationPaymentStatus.REFUNDED)
                    .privacyAccepted(true)
                    .notificationConsent(true)
                    .guestName("Test")
                    .guestEmail("test@test.com")
                    .build());

            ZonedDateTime from = ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(40);
            ZonedDateTime to = ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(70);

            List<Reservation> results = reservationRepository.findUpcomingForReminder(from, to);

            assertThat(results).isEmpty();
        }
    }


    @Nested
    @DisplayName("Reporting Queries")
    class ReportingQueryTests {

        @Test
        @DisplayName("countByDateRange iptal edilmisleri haric tutar")
        void countByDateRange_excludesCancelled() {
            ZonedDateTime march15_18 = ZonedDateTime.of(2026, 3, 15, 18, 0, 0, 0, AppConstants.VIENNA);
            ZonedDateTime march15_19 = ZonedDateTime.of(2026, 3, 15, 19, 0, 0, 0, AppConstants.VIENNA);

            createReservation("RES-A", march15_18, 60, ReservationStatus.CONFIRMED, ReservationPaymentStatus.PAID);
            createReservation("RES-B", march15_19, 60, ReservationStatus.CANCELLED, ReservationPaymentStatus.REFUNDED);

            ZonedDateTime from = ZonedDateTime.of(2026, 3, 15, 0, 0, 0, 0, AppConstants.VIENNA);
            ZonedDateTime to = ZonedDateTime.of(2026, 3, 16, 0, 0, 0, 0, AppConstants.VIENNA);

            long count = reservationRepository.countByDateRange(from, to);

            assertThat(count).isEqualTo(1);
        }

        @Test
        @DisplayName("sumRevenueByDateRange toplam geliri hesaplar")
        void sumRevenueByDateRange_calculatesCorrectly() {
            ZonedDateTime march15_18 = ZonedDateTime.of(2026, 3, 15, 18, 0, 0, 0, AppConstants.VIENNA);
            ZonedDateTime march15_19 = ZonedDateTime.of(2026, 3, 15, 19, 0, 0, 0, AppConstants.VIENNA);

            createReservation("RES-A", march15_18, 60, ReservationStatus.CONFIRMED, ReservationPaymentStatus.PAID);
            createReservation("RES-B", march15_19, 60, ReservationStatus.CONFIRMED, ReservationPaymentStatus.PAID);

            ZonedDateTime from = ZonedDateTime.of(2026, 3, 15, 0, 0, 0, 0, AppConstants.VIENNA);
            ZonedDateTime to = ZonedDateTime.of(2026, 3, 16, 0, 0, 0, 0, AppConstants.VIENNA);

            BigDecimal revenue = reservationRepository.sumRevenueByDateRange(from, to);

            assertThat(revenue).isEqualByComparingTo(new BigDecimal("160.00"));
        }

        @Test
        @DisplayName("sumRevenueByDateRange bos aralik sifir doner")
        void sumRevenueByDateRange_empty_returnsZero() {
            ZonedDateTime from = ZonedDateTime.of(2026, 1, 1, 0, 0, 0, 0, AppConstants.VIENNA);
            ZonedDateTime to = ZonedDateTime.of(2026, 1, 2, 0, 0, 0, 0, AppConstants.VIENNA);

            BigDecimal revenue = reservationRepository.sumRevenueByDateRange(from, to);

            assertThat(revenue).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }
}
