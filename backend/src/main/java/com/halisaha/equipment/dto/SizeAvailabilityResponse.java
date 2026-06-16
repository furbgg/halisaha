package com.halisaha.equipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SizeAvailabilityResponse {
    private String size;
    private int totalStock;
    private int available;
}
