package com.halisaha.admin.dto;

import com.halisaha.payment.PaymentMethod;
import com.halisaha.reservation.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private long todayReservations;
    private long yesterdayReservations;
    private BigDecimal todayRevenue;
    private String lastBookingAgo;

    private long weekReservations;
    private BigDecimal weekRevenue;

    private long monthReservations;
    private BigDecimal monthRevenue;

    private double utilizationPercent;

    private BigDecimal refundedAmount;
    private int refundedCount;
    private long failedPaymentCount;

    private List<FieldStat> fieldStats;
    private List<UpcomingReservation> upcomingReservations;
    private List<TimelineEntry> todayTimeline;
    private List<DailyRevenue> weeklyRevenue;
    private List<PaymentMethodStat> paymentMethodStats;
    private List<MaterialStat> topMaterials;
    private List<MonthlyRevenue> monthlyTrend;
    private List<HeatmapCell> hourlyHeatmap;

    private InsightResponse insights;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldStat {
        private Long fieldId;
        private String fieldName;
        private long reservationCount;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpcomingReservation {
        private Long id;
        private String confirmationCode;
        private String fieldName;
        private String customerName;
        private String startTime;
        private String endTime;
        private int durationMinutes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineEntry {
        private String fieldName;
        private String customerName;
        private String startTime;
        private String endTime;
        private ReservationStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenue {
        private String dayLabel;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethodStat {
        private PaymentMethod method;
        private long count;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaterialStat {
        private String name;
        private long rentalCount;
        private long maxRentals;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String monthLabel;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeatmapCell {
        private String dayOfWeek;
        private String timeSlot;
        private double intensity;
    }
}
