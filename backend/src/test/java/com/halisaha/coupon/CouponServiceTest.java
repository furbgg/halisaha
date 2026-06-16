package com.halisaha.coupon;

import com.halisaha.common.AppConstants;
import com.halisaha.common.exception.InvalidReservationException;
import com.halisaha.coupon.dto.CouponResponse;
import com.halisaha.coupon.dto.CreateCouponRequest;
import com.halisaha.coupon.entity.Coupon;
import com.halisaha.coupon.repository.CouponRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @InjectMocks
    private CouponService couponService;

    private Coupon createValidCoupon() {
        return Coupon.builder()
                .id(1L)
                .code("TESTCODE")
                .discountType(DiscountType.FIXED)
                .discountValue(BigDecimal.valueOf(10))
                .minOrderAmount(BigDecimal.valueOf(20))
                .active(true)
                .validFrom(ZonedDateTime.now(AppConstants.VIENNA).minusDays(1))
                .validUntil(ZonedDateTime.now(AppConstants.VIENNA).plusDays(1))
                .maxUses(100)
                .currentUses(0)
                .build();
    }

    @Test
    void assertCouponValid_shouldPass_whenCouponValid() {
        Coupon coupon = createValidCoupon();
        when(couponRepository.findByCodeIgnoreCase("TESTCODE")).thenReturn(Optional.of(coupon));

        couponService.assertCouponValid("TESTCODE", BigDecimal.valueOf(50));
    }

    @Test
    void assertCouponValid_shouldThrow_whenCouponNotFound() {
        when(couponRepository.findByCodeIgnoreCase("NOTFOUND")).thenReturn(Optional.empty());

        assertThrows(InvalidReservationException.class, 
            () -> couponService.assertCouponValid("NOTFOUND", BigDecimal.valueOf(50)));
    }

    @Test
    void assertCouponValid_shouldThrow_whenCouponInactive() {
        Coupon coupon = createValidCoupon();
        coupon.setActive(false);
        when(couponRepository.findByCodeIgnoreCase("TESTCODE")).thenReturn(Optional.of(coupon));

        assertThrows(InvalidReservationException.class,
                () -> couponService.assertCouponValid("TESTCODE", BigDecimal.valueOf(50)));
    }

    @Test
    void assertCouponValid_shouldThrow_whenCouponExpired() {
        Coupon coupon = createValidCoupon();
        coupon.setValidUntil(ZonedDateTime.now(AppConstants.VIENNA).minusDays(1));
        when(couponRepository.findByCodeIgnoreCase("TESTCODE")).thenReturn(Optional.of(coupon));

        assertThrows(InvalidReservationException.class,
                () -> couponService.assertCouponValid("TESTCODE", BigDecimal.valueOf(50)));
    }

    @Test
    void assertCouponValid_shouldThrow_whenMaxUsesReached() {
        Coupon coupon = createValidCoupon();
        coupon.setCurrentUses(100);
        when(couponRepository.findByCodeIgnoreCase("TESTCODE")).thenReturn(Optional.of(coupon));

        assertThrows(InvalidReservationException.class,
                () -> couponService.assertCouponValid("TESTCODE", BigDecimal.valueOf(50)));
    }

    @Test
    void assertCouponValid_shouldThrow_whenBelowMinimumOrder() {
        Coupon coupon = createValidCoupon();
        when(couponRepository.findByCodeIgnoreCase("TESTCODE")).thenReturn(Optional.of(coupon));

        assertThrows(InvalidReservationException.class,
                () -> couponService.assertCouponValid("TESTCODE", BigDecimal.valueOf(10)));
    }

    @Test
    void calculateDiscount_shouldReturnPercentageDiscount() {
        Coupon coupon = createValidCoupon();
        coupon.setDiscountType(DiscountType.PERCENTAGE);
        coupon.setDiscountValue(BigDecimal.valueOf(20));
        when(couponRepository.findByCodeIgnoreCase("TESTCODE")).thenReturn(Optional.of(coupon));

        BigDecimal discount = couponService.calculateDiscount("TESTCODE", BigDecimal.valueOf(100));

        assertThat(discount.compareTo(BigDecimal.valueOf(20))).isEqualTo(0);
    }

    @Test
    void calculateDiscount_shouldReturnFixedDiscount() {
        Coupon coupon = createValidCoupon();
        when(couponRepository.findByCodeIgnoreCase("TESTCODE")).thenReturn(Optional.of(coupon));

        BigDecimal discount = couponService.calculateDiscount("TESTCODE", BigDecimal.valueOf(100));

        assertThat(discount.compareTo(BigDecimal.valueOf(10))).isEqualTo(0);
    }

    @Test
    void calculateDiscount_shouldNotExceedTotalPrice() {
        Coupon coupon = createValidCoupon();
        coupon.setDiscountValue(BigDecimal.valueOf(50));
        when(couponRepository.findByCodeIgnoreCase("TESTCODE")).thenReturn(Optional.of(coupon));

        BigDecimal discount = couponService.calculateDiscount("TESTCODE", BigDecimal.valueOf(30));

        assertThat(discount.compareTo(BigDecimal.valueOf(30))).isEqualTo(0);
    }

    @Test
    void incrementUsage_shouldIncrementCurrentUses() {
        Coupon coupon = createValidCoupon();
        when(couponRepository.findByCodeForUpdate("TESTCODE")).thenReturn(Optional.of(coupon));

        couponService.incrementUsage("TESTCODE");

        assertThat(coupon.getCurrentUses()).isEqualTo(1);
        verify(couponRepository).save(coupon);
    }

    @Test
    void incrementUsage_shouldSkip_whenMaxUsesReached() {
        Coupon coupon = createValidCoupon();
        coupon.setCurrentUses(100);
        when(couponRepository.findByCodeForUpdate("TESTCODE")).thenReturn(Optional.of(coupon));

        couponService.incrementUsage("TESTCODE");

        assertThat(coupon.getCurrentUses()).isEqualTo(100);
        verify(couponRepository, never()).save(any());
    }

    @Test
    void incrementUsage_shouldDoNothing_whenCodeNull() {
        couponService.incrementUsage(null);
        verify(couponRepository, never()).findByCodeForUpdate(any());
    }

    @Test
    void createCoupon_shouldSaveNewCoupon() {
        CreateCouponRequest req = new CreateCouponRequest();
        req.setCode("NEWCODE");
        req.setDiscountType("FIXED");
        req.setDiscountValue(BigDecimal.TEN);

        when(couponRepository.existsByCodeIgnoreCase("NEWCODE")).thenReturn(false);
        when(couponRepository.save(any())).thenReturn(createValidCoupon());

        CouponResponse res = couponService.createCoupon(req);

        verify(couponRepository).save(any());
        assertThat(res).isNotNull();
    }

    @Test
    void createCoupon_shouldThrow_whenCodeAlreadyExists() {
        CreateCouponRequest req = new CreateCouponRequest();
        req.setCode("TESTCODE");

        when(couponRepository.existsByCodeIgnoreCase("TESTCODE")).thenReturn(true);

        assertThrows(InvalidReservationException.class, () -> couponService.createCoupon(req));
    }

    @Test
    void deleteCoupon_shouldDeleteExistingCoupon() {
        when(couponRepository.existsById(1L)).thenReturn(true);

        couponService.deleteCoupon(1L);

        verify(couponRepository).deleteById(1L);
    }
}
