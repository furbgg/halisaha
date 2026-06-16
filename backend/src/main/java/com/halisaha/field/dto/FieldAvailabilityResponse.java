package com.halisaha.field.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldAvailabilityResponse {

    private Long fieldId;
    private String fieldName;
    private LocalDate date;
    private int durationMinutes;
    private List<TimeSlot> slots;
}
