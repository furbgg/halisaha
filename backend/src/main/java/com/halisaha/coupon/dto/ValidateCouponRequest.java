package com.halisaha.coupon.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateCouponRequest {

    @NotBlank(message = "Gutscheincode darf nicht leer sein")
    private String code;

    @NotNull(message = "Bestellbetrag ist erforderlich")
    @DecimalMin(value = "0", message = "Bestellbetrag darf nicht negativ sein")
    private BigDecimal orderAmount;
}
