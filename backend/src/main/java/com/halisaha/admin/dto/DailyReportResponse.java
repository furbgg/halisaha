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
public class DailyReportResponse {

    private String date;
    private long totalReservations;
    private long cancelledReservations;
    private long completedReservations;
    private BigDecimal totalRevenue;
    private BigDecimal paidRevenue;
    private BigDecimal onSiteRevenue;
    private BigDecimal refundedAmount;
    private BigDecimal netRevenue;
    private BigDecimal equipmentRentalRevenue;
    private List<FieldBreakdown> fieldBreakdown;
    private Map<Integer, Long> hourlyBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldBreakdown {
        private Long fieldId;
        private String fieldName;
        private long reservationCount;
        private BigDecimal revenue;
    }
}
