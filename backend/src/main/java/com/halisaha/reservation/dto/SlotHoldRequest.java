package com.halisaha.reservation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlotHoldRequest {

    @NotNull(message = "Platz-ID darf nicht leer sein")
    private Long fieldId;

    @NotNull(message = "Startzeit darf nicht leer sein")
    private ZonedDateTime startTime;

    @NotNull(message = "Dauer darf nicht leer sein")
    private Integer durationMinutes;

    @NotNull(message = "Session-ID darf nicht leer sein")
    private String sessionId;
}
