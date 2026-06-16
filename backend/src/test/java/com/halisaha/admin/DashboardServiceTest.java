package com.halisaha.admin;

import com.halisaha.common.AppConstants;

import com.halisaha.admin.dto.DashboardResponse;
import com.halisaha.equipment.repository.EquipmentRentalRepository;
import com.halisaha.field.entity.Field;
import com.halisaha.field.repository.FieldRepository;
import com.halisaha.payment.repository.PaymentRepository;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.repository.ReservationRepository;
import com.halisaha.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService — Admin İstatistik Paneli")
class DashboardServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private EquipmentRentalRepository equipmentRentalRepository;

    @Mock
    private FieldRepository fieldRepository;

    @InjectMocks
    private DashboardService dashboardService;


    @Test
    @DisplayName("bugün 5 termin, 250€ → doğru sayılar")
    void todayStats() {
        when(reservationRepository.countByDateRange(any(), any()))
                .thenReturn(5L)
                .thenReturn(3L)
                .thenReturn(20L)
                .thenReturn(80L);
        when(reservationRepository.sumRevenueByDateRange(any(), any()))
                .thenReturn(new BigDecimal("250.00"))
                .thenReturn(new BigDecimal("1000.00"))
                .thenReturn(new BigDecimal("4000.00"));
        when(reservationRepository.getFieldStats(any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservationRepository.findByDate(any(), any()))
                .thenReturn(Collections.emptyList());

        DashboardResponse resp = dashboardService.getDashboard();

        assertThat(resp.getTodayReservations()).isEqualTo(5);
        assertThat(resp.getTodayRevenue()).isEqualByComparingTo(new BigDecimal("250.00"));
        assertThat(resp.getWeekReservations()).isEqualTo(20);
        assertThat(resp.getWeekRevenue()).isEqualByComparingTo(new BigDecimal("1000.00"));
        assertThat(resp.getMonthReservations()).isEqualTo(80);
        assertThat(resp.getMonthRevenue()).isEqualByComparingTo(new BigDecimal("4000.00"));
    }

    @Test
    @DisplayName("hiç termin yok → sıfır değerler")
    void emptyDashboard() {
        when(reservationRepository.countByDateRange(any(), any()))
                .thenReturn(0L);
        when(reservationRepository.sumRevenueByDateRange(any(), any()))
                .thenReturn(BigDecimal.ZERO);
        when(reservationRepository.getFieldStats(any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservationRepository.findByDate(any(), any()))
                .thenReturn(Collections.emptyList());

        DashboardResponse resp = dashboardService.getDashboard();

        assertThat(resp.getTodayReservations()).isEqualTo(0);
        assertThat(resp.getTodayRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(resp.getFieldStats()).isEmpty();
        assertThat(resp.getUpcomingReservations()).isEmpty();
    }


    @Test
    @DisplayName("3 saha istatistiği → fieldStats listesi doğru")
    void fieldStatsBreakdown() {
        Object[] platz1 = new Object[] { 1L, "Platz 1", 15L, new BigDecimal("750.00") };
        Object[] platz2 = new Object[] { 2L, "Platz 2", 10L, new BigDecimal("500.00") };
        Object[] platz3 = new Object[] { 3L, "VIP Platz", 5L, new BigDecimal("300.00") };

        when(reservationRepository.countByDateRange(any(), any())).thenReturn(30L);
        when(reservationRepository.sumRevenueByDateRange(any(), any()))
                .thenReturn(new BigDecimal("1550.00"));
        when(reservationRepository.getFieldStats(any(), any()))
                .thenReturn(List.of(platz1, platz2, platz3));
        when(reservationRepository.findByDate(any(), any()))
                .thenReturn(Collections.emptyList());

        DashboardResponse resp = dashboardService.getDashboard();

        assertThat(resp.getFieldStats()).hasSize(3);
        assertThat(resp.getFieldStats().get(0).getFieldName()).isEqualTo("Platz 1");
        assertThat(resp.getFieldStats().get(0).getReservationCount()).isEqualTo(15);
        assertThat(resp.getFieldStats().get(0).getRevenue()).isEqualByComparingTo(new BigDecimal("750.00"));

        assertThat(resp.getFieldStats().get(2).getFieldName()).isEqualTo("VIP Platz");
        assertThat(resp.getFieldStats().get(2).getRevenue()).isEqualByComparingTo(new BigDecimal("300.00"));
    }


    @Test
    @DisplayName("yaklaşan terminler — upcoming listesi")
    void upcomingReservations() {
        Field field = Field.builder().id(1L).name("Platz 1").build();
        User user = User.builder().id(10L).name("Max Mustermann").build();

        Reservation upcoming1 = Reservation.builder()
                .gameType("FOOTBALL")
                .id(100L)
                .confirmationCode("RES-ABC123")
                .field(field)
                .user(user)
                .startTime(ZonedDateTime.now(AppConstants.VIENNA).plusHours(2))
                .endTime(ZonedDateTime.now(AppConstants.VIENNA).plusHours(3))
                .durationMinutes(60)
                .build();

        Reservation upcoming2 = Reservation.builder()
                .gameType("FOOTBALL")
                .id(101L)
                .confirmationCode("RES-DEF456")
                .field(field)
                .user(null)
                .guestName("Ali Yılmaz")
                .startTime(ZonedDateTime.now(AppConstants.VIENNA).plusHours(4))
                .endTime(ZonedDateTime.now(AppConstants.VIENNA).plusHours(5).plusMinutes(30))
                .durationMinutes(90)
                .build();

        when(reservationRepository.countByDateRange(any(), any())).thenReturn(2L);
        when(reservationRepository.sumRevenueByDateRange(any(), any()))
                .thenReturn(new BigDecimal("125.00"));
        when(reservationRepository.getFieldStats(any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservationRepository.findByDate(any(), any()))
                .thenReturn(List.of(upcoming1, upcoming2));

        DashboardResponse resp = dashboardService.getDashboard();

        assertThat(resp.getUpcomingReservations()).hasSize(2);

        assertThat(resp.getUpcomingReservations().get(0).getCustomerName()).isEqualTo("Max Mustermann");
        assertThat(resp.getUpcomingReservations().get(0).getFieldName()).isEqualTo("Platz 1");
        assertThat(resp.getUpcomingReservations().get(0).getDurationMinutes()).isEqualTo(60);

        assertThat(resp.getUpcomingReservations().get(1).getCustomerName()).isEqualTo("Ali Yılmaz");
        assertThat(resp.getUpcomingReservations().get(1).getDurationMinutes()).isEqualTo(90);
    }

    @Test
    @DisplayName("geçmiş terminler filtrelenir — sadece gelecek olanlar gösterilir")
    void pastReservationsFilteredOut() {
        Field field = Field.builder().id(1L).name("Platz 1").build();
        User user = User.builder().id(10L).name("Max").build();

        Reservation past = Reservation.builder()
                .gameType("FOOTBALL")
                .id(200L)
                .confirmationCode("RES-PAST")
                .field(field)
                .user(user)
                .startTime(ZonedDateTime.now(AppConstants.VIENNA).minusHours(3))
                .endTime(ZonedDateTime.now(AppConstants.VIENNA).minusHours(2))
                .durationMinutes(60)
                .build();

        Reservation future = Reservation.builder()
                .gameType("FOOTBALL")
                .id(201L)
                .confirmationCode("RES-FUTURE")
                .field(field)
                .user(user)
                .startTime(ZonedDateTime.now(AppConstants.VIENNA).plusHours(5))
                .endTime(ZonedDateTime.now(AppConstants.VIENNA).plusHours(6))
                .durationMinutes(60)
                .build();

        when(reservationRepository.countByDateRange(any(), any())).thenReturn(2L);
        when(reservationRepository.sumRevenueByDateRange(any(), any()))
                .thenReturn(new BigDecimal("100.00"));
        when(reservationRepository.getFieldStats(any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservationRepository.findByDate(any(), any()))
                .thenReturn(List.of(past, future));

        DashboardResponse resp = dashboardService.getDashboard();

        assertThat(resp.getUpcomingReservations()).hasSize(1);
        assertThat(resp.getUpcomingReservations().get(0).getConfirmationCode()).isEqualTo("RES-FUTURE");
    }

    @Test
    @DisplayName("max 10 yaklaşan termin → limit kontrolü")
    void upcomingLimitTen() {
        Field field = Field.builder().id(1L).name("Platz 1").build();
        User user = User.builder().id(10L).name("Max").build();

        List<Reservation> many = new java.util.ArrayList<>();
        for (int i = 0; i < 15; i++) {
            many.add(Reservation.builder()
                    .gameType("FOOTBALL")
                    .id((long) (300 + i))
                    .confirmationCode("RES-" + i)
                    .field(field)
                    .user(user)
                    .startTime(ZonedDateTime.now(AppConstants.VIENNA).plusHours(i + 1))
                    .endTime(ZonedDateTime.now(AppConstants.VIENNA).plusHours(i + 2))
                    .durationMinutes(60)
                    .build());
        }

        when(reservationRepository.countByDateRange(any(), any())).thenReturn(15L);
        when(reservationRepository.sumRevenueByDateRange(any(), any()))
                .thenReturn(new BigDecimal("750.00"));
        when(reservationRepository.getFieldStats(any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservationRepository.findByDate(any(), any()))
                .thenReturn(many);

        DashboardResponse resp = dashboardService.getDashboard();

        assertThat(resp.getUpcomingReservations()).hasSize(10);
    }


    @Test
    @DisplayName("revenue null döndüğünde → null geçmeli (hiç termin yoksa)")
    void revenueNull() {
        when(reservationRepository.countByDateRange(any(), any())).thenReturn(0L);
        when(reservationRepository.sumRevenueByDateRange(any(), any())).thenReturn(null);
        when(reservationRepository.getFieldStats(any(), any()))
                .thenReturn(Collections.emptyList());
        when(reservationRepository.findByDate(any(), any()))
                .thenReturn(Collections.emptyList());

        DashboardResponse resp = dashboardService.getDashboard();

        assertThat(resp.getTodayRevenue()).isNull();
    }
}
