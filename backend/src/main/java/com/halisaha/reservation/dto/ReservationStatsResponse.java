package com.halisaha.reservation.dto;

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
public class ReservationStatsResponse {

    private long totalReservations;
    private long prevMonthTotal;
    private double changePercent;

    private long cancelledCount;
    private double cancelRate;
    private double prevCancelRate;

    private String popularTimeSlot;

    private BigDecimal monthRevenue;
    private BigDecimal revenueProjection;
    private double revenueChangePercent;

    private List<DailyBookingCount> weeklyBookings;
    private List<DailyBookingCount> monthlyBookings;
    private List<FieldUtilization> fieldUtilization;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyBookingCount {
        private String label;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldUtilization {
        private Long fieldId;
        private String fieldName;
        private long bookedHours;
        private long totalHours;
        private double percent;
        private double prevPercent;
    }
}
