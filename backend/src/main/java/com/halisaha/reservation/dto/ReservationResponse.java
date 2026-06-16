package com.halisaha.reservation.dto;

import com.halisaha.payment.PaymentMethod;
import com.halisaha.payment.ReservationPaymentStatus;
import com.halisaha.reservation.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {

    private Long id;
    private String confirmationCode;
    private Long fieldId;
    private String fieldName;
    private String fieldType;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String manageToken;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private Integer durationMinutes;
    private BigDecimal totalPrice;
    private ReservationStatus status;
    private ReservationPaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private String couponCode;
    private BigDecimal discountAmount;
    private ZonedDateTime createdAt;
    private List<RentalInfo> equipmentRentals;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RentalInfo {
        private String equipmentName;
        private Integer quantity;
        private String size;
        private BigDecimal price;
    }
}
