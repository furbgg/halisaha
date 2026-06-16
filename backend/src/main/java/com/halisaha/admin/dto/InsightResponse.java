package com.halisaha.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsightResponse {

    private String analyzedMonth;
    private int totalReservations;
    private List<FieldInsight> fieldInsights;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldInsight {
        private Long fieldId;
        private String fieldName;
        private int totalBookings;
        private List<WeakDay> weakestDays;
        private List<WeakSlot> weakestSlots;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeakDay {
        private String dayName;
        private int bookingCount;
        private double avgOtherDays;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeakSlot {
        private String dayName;
        private String timeRange;
        private int bookingCount;
    }
}
