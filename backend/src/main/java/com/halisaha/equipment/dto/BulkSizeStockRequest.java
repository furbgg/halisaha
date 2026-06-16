package com.halisaha.equipment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkSizeStockRequest {

    @NotEmpty(message = "Mindestens eine Größe erforderlich")
    @Valid
    private List<SizeStockRequest> sizeStocks;
}
