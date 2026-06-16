package com.halisaha.coupon;

import com.halisaha.common.dto.ApiResponse;
import com.halisaha.coupon.dto.ValidateCouponRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class PublicCouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validate(
            @Valid @RequestBody ValidateCouponRequest request) {
        Map<String, Object> result = couponService.validateCoupon(request.getCode(), request.getOrderAmount());
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
