package com.halisaha.coupon.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCouponRequest {

    @NotBlank(message = "Gutscheincode darf nicht leer sein")
    @Size(max = 50, message = "Gutscheincode darf max. 50 Zeichen lang sein")
    private String code;

    @NotNull(message = "Rabatttyp ist erforderlich")
    private String discountType;

    @NotNull(message = "Rabattwert ist erforderlich")
    @DecimalMin(value = "0.01", message = "Rabattwert muss größer als 0 sein")
    private BigDecimal discountValue;

    @Min(value = 0, message = "Maximale Nutzungen darf nicht negativ sein")
    private Integer maxUses = 0;

    @DecimalMin(value = "0", message = "Mindestbestellwert darf nicht negativ sein")
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @NotNull(message = "Gültig ab ist erforderlich")
    private ZonedDateTime validFrom;

    @NotNull(message = "Gültig bis ist erforderlich")
    private ZonedDateTime validUntil;

    private Boolean active = true;
}
