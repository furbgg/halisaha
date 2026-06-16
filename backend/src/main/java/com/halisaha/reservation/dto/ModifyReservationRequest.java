package com.halisaha.reservation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModifyReservationRequest {

    @NotNull(message = "Neue Startzeit darf nicht leer sein")
    private ZonedDateTime startTime;

    @NotNull(message = "Dauer darf nicht leer sein")
    @Min(value = 60, message = "Mindestdauer ist 60 Minuten")
    @Max(value = 180, message = "Maximaldauer ist 180 Minuten")
    private Integer durationMinutes;
}
