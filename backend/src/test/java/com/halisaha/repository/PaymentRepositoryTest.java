package com.halisaha.repository;

import com.halisaha.RepositoryTestBase;
import com.halisaha.payment.StripePaymentStatus;
import com.halisaha.payment.entity.Payment;
import com.halisaha.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("PaymentRepository — H2 Repository Tests")
class PaymentRepositoryTest extends RepositoryTestBase {

    @Autowired
    private PaymentRepository paymentRepository;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
    }

    private Payment createPayment(String piId, Long reservationId, StripePaymentStatus status) {
        return paymentRepository.save(Payment.builder()
                .stripePaymentIntentId(piId)
                .reservationId(reservationId)
                .amount(new BigDecimal("100.00"))
                .status(status)
                .build());
    }


    @Nested
    @DisplayName("findByStripePaymentIntentId")
    class FindByStripePaymentIntentIdTests {

        @Test
        @DisplayName("Var olan PI ID ile payment bulunur")
        void findByPiId_existing_returnsPayment() {
            createPayment("pi_test_123", 1L, StripePaymentStatus.SUCCEEDED);

            Optional<Payment> result = paymentRepository.findByStripePaymentIntentId("pi_test_123");

            assertThat(result).isPresent();
            assertThat(result.get().getStripePaymentIntentId()).isEqualTo("pi_test_123");
        }

        @Test
        @DisplayName("Olmayan PI ID — empty doner")
        void findByPiId_nonExisting_returnsEmpty() {
            Optional<Payment> result = paymentRepository.findByStripePaymentIntentId("pi_nonexistent");

            assertThat(result).isEmpty();
        }
    }


    @Nested
    @DisplayName("findByReservationId")
    class FindByReservationIdTests {

        @Test
        @DisplayName("ReservationId ile payment listesi doner")
        void findByReservationId_returnsPayments() {
            createPayment("pi_1", 42L, StripePaymentStatus.SUCCEEDED);
            createPayment("pi_2", 42L, StripePaymentStatus.FAILED);
            createPayment("pi_3", 99L, StripePaymentStatus.PENDING);

            List<Payment> results = paymentRepository.findByReservationId(42L);

            assertThat(results).hasSize(2);
        }
    }


    @Nested
    @DisplayName("findByReservationIdAndStatus")
    class FindByReservationIdAndStatusTests {

        @Test
        @DisplayName("ReservationId + status ile filtreler")
        void findByReservationIdAndStatus_filtersCorrectly() {
            createPayment("pi_s1", 42L, StripePaymentStatus.SUCCEEDED);
            createPayment("pi_s2", 42L, StripePaymentStatus.FAILED);

            Optional<Payment> result = paymentRepository
                    .findByReservationIdAndStatus(42L, StripePaymentStatus.SUCCEEDED);

            assertThat(result).isPresent();
            assertThat(result.get().getStripePaymentIntentId()).isEqualTo("pi_s1");
        }

        @Test
        @DisplayName("Eslesen olmayan status — empty doner")
        void findByReservationIdAndStatus_noMatch_returnsEmpty() {
            createPayment("pi_pend", 42L, StripePaymentStatus.PENDING);

            Optional<Payment> result = paymentRepository
                    .findByReservationIdAndStatus(42L, StripePaymentStatus.REFUNDED);

            assertThat(result).isEmpty();
        }
    }
}
