package com.halisaha.coupon;

import com.halisaha.common.AppConstants;
import com.halisaha.common.exception.InvalidReservationException;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.coupon.dto.CouponResponse;
import com.halisaha.coupon.dto.CreateCouponRequest;
import com.halisaha.coupon.entity.Coupon;
import com.halisaha.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;


    /**
     * Validates a coupon code against the current time and order amount.
     * Returns a map with: valid (boolean), discountAmount (BigDecimal), message
     * (String)
     */
    public Map<String, Object> validateCoupon(String code, BigDecimal orderAmount) {
        var optCoupon = couponRepository.findByCodeIgnoreCase(code.trim());
        if (optCoupon.isEmpty()) {
            return Map.of("valid", false, "discountAmount", BigDecimal.ZERO,
                    "message", "Ungültiger Gutscheincode.");
        }

        Coupon coupon = optCoupon.get();
        ZonedDateTime now = ZonedDateTime.now(AppConstants.VIENNA);

        if (!coupon.getActive()) {
            return Map.of("valid", false, "discountAmount", BigDecimal.ZERO,
                    "message", "Dieser Gutschein ist deaktiviert.");
        }

        if (now.isBefore(coupon.getValidFrom())) {
            return Map.of("valid", false, "discountAmount", BigDecimal.ZERO,
                    "message", "Dieser Gutschein ist noch nicht gültig.");
        }

        if (now.isAfter(coupon.getValidUntil())) {
            return Map.of("valid", false, "discountAmount", BigDecimal.ZERO,
                    "message", "Dieser Gutschein ist abgelaufen.");
        }

        if (coupon.getMaxUses() > 0 && coupon.getCurrentUses() >= coupon.getMaxUses()) {
            return Map.of("valid", false, "discountAmount", BigDecimal.ZERO,
                    "message", "Dieser Gutschein wurde bereits vollständig eingelöst.");
        }

        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            return Map.of("valid", false, "discountAmount", BigDecimal.ZERO,
                    "message",
                    "Mindestbestellwert von €" + coupon.getMinOrderAmount().setScale(2) + " nicht erreicht.");
        }

        BigDecimal discount = calculateDiscount(coupon, orderAmount);

        return Map.of("valid", true, "discountAmount", discount,
                "discountType", coupon.getDiscountType().name(),
                "discountValue", coupon.getDiscountValue(),
                "message", "Gutschein erfolgreich angewendet!");
    }


    public BigDecimal calculateDiscount(String code, BigDecimal orderAmount) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new InvalidReservationException("Ungültiger Gutscheincode."));
        return calculateDiscount(coupon, orderAmount);
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal discount = orderAmount.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            return discount.min(orderAmount);
        } else {
            return coupon.getDiscountValue().min(orderAmount);
        }
    }


    @Transactional
    public void incrementUsage(String code) {
        if (code == null || code.isBlank())
            return;

        var optCoupon = couponRepository.findByCodeForUpdate(code.trim());
        if (optCoupon.isPresent()) {
            Coupon coupon = optCoupon.get();
            if (coupon.getMaxUses() > 0 && coupon.getCurrentUses() >= coupon.getMaxUses()) {
                log.warn("Coupon '{}' max uses ({}) already reached, skipping increment", code, coupon.getMaxUses());
                return;
            }
            coupon.setCurrentUses(coupon.getCurrentUses() + 1);
            couponRepository.save(coupon);
            log.info("Coupon '{}' usage incremented to {}/{}", code, coupon.getCurrentUses(),
                    coupon.getMaxUses() == 0 ? "∞" : coupon.getMaxUses());
        }
    }


    public void assertCouponValid(String code, BigDecimal orderAmount) {
        Map<String, Object> result = validateCoupon(code, orderAmount);
        if (!(boolean) result.get("valid")) {
            throw new InvalidReservationException((String) result.get("message"));
        }
    }


    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CouponResponse getCouponById(Long id) {
        return toResponse(couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gutschein nicht gefunden")));
    }

    @Transactional
    public CouponResponse createCoupon(CreateCouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode().trim())) {
            throw new InvalidReservationException("Ein Gutschein mit diesem Code existiert bereits.");
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().trim().toUpperCase())
                .discountType(DiscountType.valueOf(request.getDiscountType().toUpperCase()))
                .discountValue(request.getDiscountValue())
                .maxUses(request.getMaxUses() != null ? request.getMaxUses() : 0)
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CreateCouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gutschein nicht gefunden"));

        coupon.setCode(request.getCode().trim().toUpperCase());
        coupon.setDiscountType(DiscountType.valueOf(request.getDiscountType().toUpperCase()));
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMaxUses(request.getMaxUses() != null ? request.getMaxUses() : 0);
        coupon.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidUntil(request.getValidUntil());
        coupon.setActive(request.getActive() != null ? request.getActive() : true);

        return toResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Gutschein nicht gefunden");
        }
        couponRepository.deleteById(id);
    }

    @Transactional
    public CouponResponse toggleCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gutschein nicht gefunden"));
        coupon.setActive(!coupon.getActive());
        return toResponse(couponRepository.save(coupon));
    }


    private CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType().name())
                .discountValue(coupon.getDiscountValue())
                .maxUses(coupon.getMaxUses())
                .currentUses(coupon.getCurrentUses())
                .minOrderAmount(coupon.getMinOrderAmount())
                .validFrom(coupon.getValidFrom())
                .validUntil(coupon.getValidUntil())
                .active(coupon.getActive())
                .createdAt(coupon.getCreatedAt())
                .build();
    }
}
