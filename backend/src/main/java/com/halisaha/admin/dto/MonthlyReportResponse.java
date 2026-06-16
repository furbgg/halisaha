package com.halisaha.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReportResponse {

    private String month;
    private long totalReservations;
    private long cancelledReservations;
    private BigDecimal totalRevenue;
    private BigDecimal paidRevenue;
    private BigDecimal onSiteRevenue;
    private BigDecimal refundedAmount;
    private BigDecimal netRevenue;
    private BigDecimal averageDailyRevenue;
    private BigDecimal equipmentRentalRevenue;
    private String busiestDay;
    private int busiestHour;
    private int quietestHour;
    private Map<String, Long> paymentMethodBreakdown;
    private List<DailyReportResponse.FieldBreakdown> fieldComparison;
    private ComparisonToPreviousMonth comparison;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonToPreviousMonth {
        private BigDecimal revenueChange;
        private double revenueChangePercent;
        private long reservationChange;
    }
}
