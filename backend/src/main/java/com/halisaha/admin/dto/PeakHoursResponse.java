package com.halisaha.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeakHoursResponse {

    private String month;
    private Map<Integer, Double> hourlyOccupancy;
    private List<Integer> peakHours;
    private List<Integer> quietHours;
    private String recommendation;
}
