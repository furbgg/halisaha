package com.halisaha.admin;

import com.halisaha.common.AppConstants;

import com.halisaha.admin.dto.DailyReportResponse;
import com.halisaha.admin.dto.MonthlyReportResponse;
import com.halisaha.admin.dto.PeakHoursResponse;
import com.halisaha.equipment.entity.EquipmentRental;
import com.halisaha.equipment.repository.EquipmentRentalRepository;
import com.halisaha.field.repository.FieldRepository;
import com.halisaha.payment.PaymentMethod;
import com.halisaha.payment.ReservationPaymentStatus;
import com.halisaha.reservation.ReservationStatus;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.YearMonth;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportService — Raporlama Hesaplamalari")
class ReportServiceTest {

    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private FieldRepository fieldRepository;
    @Mock
    private EquipmentRentalRepository equipmentRentalRepository;

    @InjectMocks
    private ReportService reportService;

    private List<Reservation> sampleReservations;

    @BeforeEach
    void setUp() {
        Reservation r1 = Reservation.builder()
                .gameType("FOOTBALL")
                .id(1L).status(ReservationStatus.CONFIRMED)
                .paymentStatus(ReservationPaymentStatus.PAID)
                .paymentMethod(PaymentMethod.CARD)
                .totalPrice(new BigDecimal("100.00"))
                .startTime(ZonedDateTime.of(2026, 3, 15, 18, 0, 0, 0, AppConstants.VIENNA))
                .endTime(ZonedDateTime.of(2026, 3, 15, 19, 0, 0, 0, AppConstants.VIENNA))
                .build();

        Reservation r2 = Reservation.builder()
                .gameType("FOOTBALL")
                .id(2L).status(ReservationStatus.COMPLETED)
                .paymentStatus(ReservationPaymentStatus.ON_SITE)
                .paymentMethod(PaymentMethod.ON_SITE)
                .totalPrice(new BigDecimal("80.00"))
                .startTime(ZonedDateTime.of(2026, 3, 15, 19, 0, 0, 0, AppConstants.VIENNA))
                .endTime(ZonedDateTime.of(2026, 3, 15, 20, 0, 0, 0, AppConstants.VIENNA))
                .build();

        Reservation r3 = Reservation.builder()
                .gameType("FOOTBALL")
                .id(3L).status(ReservationStatus.CANCELLED)
                .paymentStatus(ReservationPaymentStatus.REFUNDED)
                .totalPrice(new BigDecimal("100.00"))
                .startTime(ZonedDateTime.of(2026, 3, 15, 20, 0, 0, 0, AppConstants.VIENNA))
                .endTime(ZonedDateTime.of(2026, 3, 15, 21, 0, 0, 0, AppConstants.VIENNA))
                .build();

        sampleReservations = List.of(r1, r2, r3);
    }


    @Nested
    @DisplayName("getDailyReport")
    class GetDailyReportTests {

        @Test
        @DisplayName("Gunluk rapor — gelir hesaplama dogru")
        void getDailyReport_calculatesRevenueCorrectly() {
            LocalDate date = LocalDate.of(2026, 3, 15);
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(sampleReservations);
            when(reservationRepository.getFieldStats(any(), any())).thenReturn(Collections.emptyList());
            when(equipmentRentalRepository.findByReservationIdIn(anyList())).thenReturn(Collections.emptyList());

            DailyReportResponse report = reportService.getDailyReport(date);

            assertThat(report.getDate()).isEqualTo("2026-03-15");
            assertThat(report.getTotalReservations()).isEqualTo(2);
            assertThat(report.getCancelledReservations()).isEqualTo(1);
            assertThat(report.getCompletedReservations()).isEqualTo(1);
            assertThat(report.getPaidRevenue()).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(report.getOnSiteRevenue()).isEqualByComparingTo(new BigDecimal("80.00"));
            assertThat(report.getTotalRevenue()).isEqualByComparingTo(new BigDecimal("180.00"));
            assertThat(report.getRefundedAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(report.getNetRevenue()).isEqualByComparingTo(new BigDecimal("80.00"));
        }

        @Test
        @DisplayName("Bos gun — tum degerler sifir")
        void getDailyReport_emptyDay_allZeros() {
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(Collections.emptyList());
            when(reservationRepository.getFieldStats(any(), any())).thenReturn(Collections.emptyList());

            DailyReportResponse report = reportService.getDailyReport(LocalDate.of(2026, 1, 1));

            assertThat(report.getTotalReservations()).isZero();
            assertThat(report.getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(report.getEquipmentRentalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Saat bazli kirilim 9-22 arasi doldurulur")
        void getDailyReport_hourlyBreakdown_coversAllHours() {
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(sampleReservations);
            when(reservationRepository.getFieldStats(any(), any())).thenReturn(Collections.emptyList());
            when(equipmentRentalRepository.findByReservationIdIn(anyList())).thenReturn(Collections.emptyList());

            DailyReportResponse report = reportService.getDailyReport(LocalDate.of(2026, 3, 15));

            assertThat(report.getHourlyBreakdown()).hasSize(14);
            assertThat(report.getHourlyBreakdown().get(18)).isEqualTo(1L);
            assertThat(report.getHourlyBreakdown().get(19)).isEqualTo(1L);
            assertThat(report.getHourlyBreakdown().get(9)).isZero();
        }

        @Test
        @DisplayName("Ekipman kiralama geliri dahil edilir")
        void getDailyReport_includesEquipmentRevenue() {
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(sampleReservations);
            when(reservationRepository.getFieldStats(any(), any())).thenReturn(Collections.emptyList());

            EquipmentRental rental = EquipmentRental.builder()
                    .rentalPrice(new BigDecimal("15.00"))
                    .build();
            when(equipmentRentalRepository.findByReservationIdIn(anyList())).thenReturn(List.of(rental));

            DailyReportResponse report = reportService.getDailyReport(LocalDate.of(2026, 3, 15));

            assertThat(report.getEquipmentRentalRevenue()).isEqualByComparingTo(new BigDecimal("15.00"));
        }
    }


    @Nested
    @DisplayName("getMonthlyReport")
    class GetMonthlyReportTests {

        @Test
        @DisplayName("Aylik rapor — ortalama gunluk gelir dogru hesaplanir")
        void getMonthlyReport_calculatesAverageDailyRevenue() {
            YearMonth month = YearMonth.of(2026, 3);
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(sampleReservations);
            when(reservationRepository.getFieldStats(any(), any())).thenReturn(Collections.emptyList());
            when(equipmentRentalRepository.findByReservationIdIn(anyList())).thenReturn(Collections.emptyList());
            when(reservationRepository.countByDateRange(any(), any())).thenReturn(0L);
            when(reservationRepository.sumRevenueByDateRange(any(), any())).thenReturn(BigDecimal.ZERO);

            MonthlyReportResponse report = reportService.getMonthlyReport(month);

            assertThat(report.getMonth()).isEqualTo("2026-03");
            assertThat(report.getAverageDailyRevenue()).isEqualByComparingTo(new BigDecimal("5.81"));
        }

        @Test
        @DisplayName("En yogun gun dogru hesaplanir")
        void getMonthlyReport_identifiesBusiestDay() {
            YearMonth month = YearMonth.of(2026, 3);
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(sampleReservations);
            when(reservationRepository.getFieldStats(any(), any())).thenReturn(Collections.emptyList());
            when(equipmentRentalRepository.findByReservationIdIn(anyList())).thenReturn(Collections.emptyList());
            when(reservationRepository.countByDateRange(any(), any())).thenReturn(0L);
            when(reservationRepository.sumRevenueByDateRange(any(), any())).thenReturn(BigDecimal.ZERO);

            MonthlyReportResponse report = reportService.getMonthlyReport(month);

            assertThat(report.getBusiestDay()).isEqualTo("15.03.2026");
        }

        @Test
        @DisplayName("Onceki ay ile karsilastirma — gelir artisi")
        void getMonthlyReport_comparisonToPreviousMonth_revenueIncrease() {
            YearMonth month = YearMonth.of(2026, 3);
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(sampleReservations);
            when(reservationRepository.getFieldStats(any(), any())).thenReturn(Collections.emptyList());
            when(equipmentRentalRepository.findByReservationIdIn(anyList())).thenReturn(Collections.emptyList());
            when(reservationRepository.countByDateRange(any(), any())).thenReturn(5L);
            when(reservationRepository.sumRevenueByDateRange(any(), any())).thenReturn(new BigDecimal("100.00"));

            MonthlyReportResponse report = reportService.getMonthlyReport(month);

            assertThat(report.getComparison().getRevenueChange()).isEqualByComparingTo(new BigDecimal("80.00"));
            assertThat(report.getComparison().getRevenueChangePercent()).isEqualTo(80.0);
        }

        @Test
        @DisplayName("Bos ay — tum istatistikler sifir")
        void getMonthlyReport_emptyMonth_allZeros() {
            YearMonth month = YearMonth.of(2026, 1);
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(Collections.emptyList());
            when(reservationRepository.getFieldStats(any(), any())).thenReturn(Collections.emptyList());
            when(reservationRepository.countByDateRange(any(), any())).thenReturn(0L);
            when(reservationRepository.sumRevenueByDateRange(any(), any())).thenReturn(BigDecimal.ZERO);

            MonthlyReportResponse report = reportService.getMonthlyReport(month);

            assertThat(report.getTotalReservations()).isZero();
            assertThat(report.getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(report.getBusiestDay()).isEqualTo("-");
        }

        @Test
        @DisplayName("Odeme yontemi dagilimi dogru gruplanir")
        void getMonthlyReport_paymentMethodBreakdown() {
            YearMonth month = YearMonth.of(2026, 3);
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(sampleReservations);
            when(reservationRepository.getFieldStats(any(), any())).thenReturn(Collections.emptyList());
            when(equipmentRentalRepository.findByReservationIdIn(anyList())).thenReturn(Collections.emptyList());
            when(reservationRepository.countByDateRange(any(), any())).thenReturn(0L);
            when(reservationRepository.sumRevenueByDateRange(any(), any())).thenReturn(BigDecimal.ZERO);

            MonthlyReportResponse report = reportService.getMonthlyReport(month);

            assertThat(report.getPaymentMethodBreakdown()).containsEntry("CARD", 1L);
            assertThat(report.getPaymentMethodBreakdown()).containsEntry("ON_SITE", 1L);
            assertThat(report.getPaymentMethodBreakdown()).hasSize(2);
        }
    }


    @Nested
    @DisplayName("getPeakHours")
    class GetPeakHoursTests {

        @Test
        @DisplayName("Doluluk orani dogru hesaplanir")
        void getPeakHours_calculatesOccupancyCorrectly() {
            YearMonth month = YearMonth.of(2026, 3);
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(sampleReservations);
            when(fieldRepository.count()).thenReturn(4L);

            PeakHoursResponse response = reportService.getPeakHours(month);

            assertThat(response.getMonth()).isEqualTo("2026-03");
            assertThat(response.getHourlyOccupancy()).hasSize(14);
            assertThat(response.getHourlyOccupancy().get(18)).isLessThan(5.0);
        }

        @Test
        @DisplayName("Sessiz saatler tespit edilir (< %30)")
        void getPeakHours_identifiesQuietHours() {
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(sampleReservations);
            when(fieldRepository.count()).thenReturn(4L);

            PeakHoursResponse response = reportService.getPeakHours(YearMonth.of(2026, 3));

            assertThat(response.getQuietHours()).isNotEmpty();
        }

        @Test
        @DisplayName("Bos ay — tum saatler sessiz")
        void getPeakHours_emptyMonth_allQuiet() {
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(Collections.emptyList());
            when(fieldRepository.count()).thenReturn(4L);

            PeakHoursResponse response = reportService.getPeakHours(YearMonth.of(2026, 1));

            assertThat(response.getQuietHours()).hasSize(14);
            assertThat(response.getPeakHours()).isEmpty();
        }

        @Test
        @DisplayName("Oneri metni sessiz saatler varsa uretilir")
        void getPeakHours_generatesRecommendation_whenQuietHoursExist() {
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(Collections.emptyList());
            when(fieldRepository.count()).thenReturn(4L);

            PeakHoursResponse response = reportService.getPeakHours(YearMonth.of(2026, 3));

            assertThat(response.getRecommendation()).contains("wenig gebucht");
            assertThat(response.getRecommendation()).contains("März");
        }

        @Test
        @DisplayName("Sifir saha — bolme hatasina yol acmaz")
        void getPeakHours_zeroFields_noDivisionError() {
            when(reservationRepository.findByDateRange(any(), any())).thenReturn(sampleReservations);
            when(fieldRepository.count()).thenReturn(0L);

            PeakHoursResponse response = reportService.getPeakHours(YearMonth.of(2026, 3));

            assertThat(response.getHourlyOccupancy().values()).allMatch(v -> v == 0.0);
        }
    }
}
