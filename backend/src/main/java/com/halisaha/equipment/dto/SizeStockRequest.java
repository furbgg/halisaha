package com.halisaha.equipment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SizeStockRequest {

    @NotBlank(message = "Größe darf nicht leer sein")
    private String size;

    @NotNull(message = "Menge darf nicht leer sein")
    @Min(value = 0, message = "Menge muss mindestens 0 sein")
    private Integer quantity;
}
