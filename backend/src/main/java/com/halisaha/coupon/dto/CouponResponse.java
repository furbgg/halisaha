package com.halisaha.coupon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {
    private Long id;
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private Integer maxUses;
    private Integer currentUses;
    private BigDecimal minOrderAmount;
    private ZonedDateTime validFrom;
    private ZonedDateTime validUntil;
    private Boolean active;
    private ZonedDateTime createdAt;
}
