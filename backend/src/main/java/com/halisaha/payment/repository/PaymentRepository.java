package com.halisaha.payment.repository;

import com.halisaha.payment.StripePaymentStatus;
import com.halisaha.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    List<Payment> findByReservationId(Long reservationId);

    Optional<Payment> findTopByReservationIdOrderByCreatedAtDesc(Long reservationId);

    Optional<Payment> findByReservationIdAndStatus(Long reservationId, StripePaymentStatus status);

    @Query("SELECT p FROM Payment p WHERE p.createdAt >= :from AND p.createdAt < :to")
    List<Payment> findByDateRange(@Param("from") ZonedDateTime from,
            @Param("to") ZonedDateTime to);

    Page<Payment> findByStatus(StripePaymentStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.refundAmount), 0) FROM Payment p " +
            "WHERE p.createdAt >= :from AND p.createdAt < :to " +
            "AND p.status IN ('REFUNDED', 'PARTIALLY_REFUNDED')")
    java.math.BigDecimal sumRefundedAmount(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

    @Query("SELECT COUNT(p) FROM Payment p " +
            "WHERE p.createdAt >= :from AND p.createdAt < :to " +
            "AND p.status IN ('REFUNDED', 'PARTIALLY_REFUNDED')")
    long countRefundedPayments(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

    @Query("SELECT COUNT(p) FROM Payment p " +
            "WHERE p.createdAt >= :from AND p.createdAt < :to " +
            "AND p.status = 'FAILED'")
    long countFailedPayments(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);
}
