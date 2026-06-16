package com.halisaha.field.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlot {

    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private boolean available;
    private boolean held;
}
