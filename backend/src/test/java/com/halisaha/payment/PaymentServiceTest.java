package com.halisaha.payment;

import com.halisaha.common.AppConstants;

import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.payment.dto.PaymentResponse;
import com.halisaha.payment.entity.Payment;
import com.halisaha.payment.repository.PaymentRepository;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.repository.ReservationRepository;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService — Ödeme İşlemleri")
class PaymentServiceTest {

    @Mock
    private StripeService stripeService;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private com.halisaha.common.service.AppSettingsService appSettingsService;

    @InjectMocks
    private PaymentService paymentService;

    private Reservation testReservation;

    @BeforeEach
    void setUp() {
        testReservation = Reservation.builder()
                .gameType("FOOTBALL")
                .id(1L)
                .confirmationCode("RES-TEST01")
                .totalPrice(new BigDecimal("100.00"))
                .paymentStatus(ReservationPaymentStatus.PENDING)
                .startTime(ZonedDateTime.now(AppConstants.VIENNA).plusDays(2))
                .endTime(ZonedDateTime.now(AppConstants.VIENNA).plusDays(2).plusHours(1))
                .build();
    }


    @Nested
    @DisplayName("initiatePayment")
    class InitiatePaymentTests {

        @Test
        @DisplayName("Basarili odeme baslangici — PaymentResponse doner")
        void initiatePayment_success_returnsPaymentResponse() throws Exception {
            PaymentIntent mockIntent = mock(PaymentIntent.class);
            when(mockIntent.getId()).thenReturn("pi_test123");
            when(mockIntent.getClientSecret()).thenReturn("pi_test123_secret_abc");

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
            when(stripeService.createPaymentIntent(new BigDecimal("100.00"), 1L)).thenReturn(mockIntent);
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
            when(reservationRepository.save(any(Reservation.class))).thenAnswer(inv -> inv.getArgument(0));

            PaymentResponse response = paymentService.initiatePayment(1L, 1L, true, null);

            assertThat(response.getClientSecret()).isEqualTo("pi_test123_secret_abc");
            assertThat(response.getPaymentIntentId()).isEqualTo("pi_test123");
            assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(response.getCurrency()).isEqualTo("eur");
            assertThat(response.getStatus()).isEqualTo("PENDING");

            verify(paymentRepository).save(argThat(p -> p.getStripePaymentIntentId().equals("pi_test123")
                    && p.getStatus() == StripePaymentStatus.PENDING
                    && p.getAmount().compareTo(new BigDecimal("100.00")) == 0));
        }

        @Test
        @DisplayName("Rezervasyon bulunamazsa ResourceNotFoundException firlatir")
        void initiatePayment_reservationNotFound_throwsException() {
            when(reservationRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.initiatePayment(999L, 1L, true, null))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Reservierung nicht gefunden");
        }

        @Test
        @DisplayName("Zaten odenmis rezervasyon icin IllegalStateException firlatir")
        void initiatePayment_alreadyPaid_throwsException() {
            testReservation.setPaymentStatus(ReservationPaymentStatus.PAID);
            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

            assertThatThrownBy(() -> paymentService.initiatePayment(1L, 1L, true, null))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Reservierung ist bereits bezahlt");
        }

        @Test
        @DisplayName("Stripe hatasi — RuntimeException firlatir")
        void initiatePayment_stripeError_throwsRuntimeException() throws Exception {
            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
            when(stripeService.createPaymentIntent(any(), any()))
                    .thenThrow(new RuntimeException("Stripe error"));

            assertThatThrownBy(() -> paymentService.initiatePayment(1L, 1L, true, null))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Zahlung konnte nicht erstellt werden");
        }
    }


    @Nested
    @DisplayName("handlePaymentSuccess")
    class HandlePaymentSuccessTests {

        @Test
        @DisplayName("Basarili odeme — status SUCCEEDED ve PAID olarak guncellenir")
        void handlePaymentSuccess_updatesStatusCorrectly() {
            Payment payment = Payment.builder()
                    .id(1L)
                    .reservationId(1L)
                    .stripePaymentIntentId("pi_success")
                    .status(StripePaymentStatus.PENDING)
                    .amount(new BigDecimal("100.00"))
                    .build();

            when(paymentRepository.findByStripePaymentIntentId("pi_success"))
                    .thenReturn(Optional.of(payment));
            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
            when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            paymentService.handlePaymentSuccess("pi_success");

            assertThat(payment.getStatus()).isEqualTo(StripePaymentStatus.SUCCEEDED);

            ArgumentCaptor<Reservation> resCaptor = ArgumentCaptor.forClass(Reservation.class);
            verify(reservationRepository).save(resCaptor.capture());
            assertThat(resCaptor.getValue().getPaymentStatus()).isEqualTo(ReservationPaymentStatus.PAID);
            assertThat(resCaptor.getValue().getPaidAt()).isNotNull();
        }

        @Test
        @DisplayName("Payment bulunamazsa ResourceNotFoundException")
        void handlePaymentSuccess_paymentNotFound_throwsException() {
            when(paymentRepository.findByStripePaymentIntentId("pi_unknown"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.handlePaymentSuccess("pi_unknown"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }


    @Nested
    @DisplayName("handlePaymentFailure")
    class HandlePaymentFailureTests {

        @Test
        @DisplayName("Basarisiz odeme — status FAILED olarak guncellenir")
        void handlePaymentFailure_updatesStatusToFailed() {
            Payment payment = Payment.builder()
                    .id(1L)
                    .reservationId(1L)
                    .stripePaymentIntentId("pi_fail")
                    .status(StripePaymentStatus.PENDING)
                    .amount(new BigDecimal("100.00"))
                    .build();

            when(paymentRepository.findByStripePaymentIntentId("pi_fail"))
                    .thenReturn(Optional.of(payment));
            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
            when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            paymentService.handlePaymentFailure("pi_fail");

            assertThat(payment.getStatus()).isEqualTo(StripePaymentStatus.FAILED);
            assertThat(testReservation.getPaymentStatus()).isEqualTo(ReservationPaymentStatus.FAILED);
        }

        @Test
        @DisplayName("Payment bulunamazsa ResourceNotFoundException")
        void handlePaymentFailure_paymentNotFound_throwsException() {
            when(paymentRepository.findByStripePaymentIntentId("pi_unknown"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.handlePaymentFailure("pi_unknown"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }


    @Nested
    @DisplayName("markAsOnSite")
    class MarkAsOnSiteTests {

        @Test
        @DisplayName("Yerinde odeme olarak isaretler")
        void markAsOnSite_setsPaymentStatusAndMethod() {
            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            paymentService.markAsOnSite(1L, 1L, true);

            assertThat(testReservation.getPaymentStatus()).isEqualTo(ReservationPaymentStatus.ON_SITE);
            assertThat(testReservation.getPaymentMethod()).isEqualTo(PaymentMethod.ON_SITE);
        }

        @Test
        @DisplayName("Rezervasyon bulunamazsa ResourceNotFoundException")
        void markAsOnSite_reservationNotFound_throwsException() {
            when(reservationRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> paymentService.markAsOnSite(999L, 1L, true))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }


    @Nested
    @DisplayName("processRefund — Iade Politikasi")
    class ProcessRefundTests {

        @BeforeEach
        void setUp() {
            testReservation.setPaymentStatus(ReservationPaymentStatus.PAID);
            testReservation.setStripePaymentIntentId("pi_refund");
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    1L, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
            SecurityContextHolder.getContext().setAuthentication(auth);
            lenient().when(appSettingsService.getInt(eq("cancellation_deadline_hours"), anyInt())).thenReturn(48);
        }

        @org.junit.jupiter.api.AfterEach
        void tearDown() {
            SecurityContextHolder.clearContext();
        }

        @Test
        @DisplayName("48+ saat once — %100 iade")
        void processRefund_moreThan48Hours_fullRefund() throws Exception {
            testReservation.setStartTime(ZonedDateTime.now(AppConstants.VIENNA).plusHours(49));

            Payment payment = Payment.builder()
                    .id(1L)
                    .stripePaymentIntentId("pi_refund")
                    .status(StripePaymentStatus.SUCCEEDED)
                    .amount(new BigDecimal("100.00"))
                    .build();

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
            when(stripeService.refundPayment(eq("pi_refund"), any())).thenReturn(mock(Refund.class));
            when(paymentRepository.findByStripePaymentIntentId("pi_refund"))
                    .thenReturn(Optional.of(payment));
            when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            BigDecimal refund = paymentService.processRefund(1L);

            assertThat(refund).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(payment.getStatus()).isEqualTo(StripePaymentStatus.REFUNDED);
            assertThat(testReservation.getPaymentStatus()).isEqualTo(ReservationPaymentStatus.REFUNDED);
            assertThat(testReservation.getRefundedAt()).isNotNull();
        }

        @Test
        @DisplayName("12 saat once (< 48h) — %0 iade, Stripe cagirilmaz")
        void processRefund_lessThan48Hours_noRefund() throws Exception {
            testReservation.setStartTime(ZonedDateTime.now(AppConstants.VIENNA).plusHours(12));

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

            BigDecimal refund = paymentService.processRefund(1L);

            assertThat(refund).isEqualByComparingTo(BigDecimal.ZERO);
            verify(stripeService, never()).refundPayment(anyString(), any());
        }

        @Test
        @DisplayName("30 dakika once (< 48h) — %0 iade, status degismez")
        void processRefund_lessThan2Hours_noRefund() throws Exception {
            testReservation.setStartTime(ZonedDateTime.now(AppConstants.VIENNA).plusMinutes(30));

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

            BigDecimal refund = paymentService.processRefund(1L);

            assertThat(refund).isEqualByComparingTo(BigDecimal.ZERO);
            verify(stripeService, never()).refundPayment(anyString(), any());
            assertThat(testReservation.getPaymentStatus()).isEqualTo(ReservationPaymentStatus.PAID);
        }

        @Test
        @DisplayName("Odenmemis rezervasyon iade edilemez")
        void processRefund_notPaid_throwsIllegalState() {
            testReservation.setPaymentStatus(ReservationPaymentStatus.PENDING);
            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

            assertThatThrownBy(() -> paymentService.processRefund(1L))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Nur bezahlte Reservierungen können erstattet werden");
        }

        @Test
        @DisplayName("Stripe iade hatasi — RuntimeException firlatir")
        void processRefund_stripeError_throwsRuntimeException() throws Exception {
            testReservation.setStartTime(ZonedDateTime.now(AppConstants.VIENNA).plusHours(49));

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
            when(stripeService.refundPayment(anyString(), any()))
                    .thenThrow(new RuntimeException("Stripe refund error"));

            assertThatThrownBy(() -> paymentService.processRefund(1L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Erstattung fehlgeschlagen");
        }
    }


    @Nested
    @DisplayName("processAdminRefund — Admin Iade")
    class ProcessAdminRefundTests {

        @BeforeEach
        void setUp() {
            testReservation.setPaymentStatus(ReservationPaymentStatus.PAID);
            testReservation.setStripePaymentIntentId("pi_admin");
            testReservation.setTotalPrice(new BigDecimal("100.00"));
        }

        @Test
        @DisplayName("Admin tam iade — status REFUNDED")
        void processAdminRefund_fullRefund_statusRefunded() throws Exception {
            Payment payment = Payment.builder()
                    .id(1L)
                    .stripePaymentIntentId("pi_admin")
                    .status(StripePaymentStatus.SUCCEEDED)
                    .amount(new BigDecimal("100.00"))
                    .build();

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
            when(stripeService.refundPayment(eq("pi_admin"), any())).thenReturn(mock(Refund.class));
            when(paymentRepository.findByStripePaymentIntentId("pi_admin"))
                    .thenReturn(Optional.of(payment));
            when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            BigDecimal refund = paymentService.processAdminRefund(1L, new BigDecimal("100.00"));

            assertThat(refund).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(payment.getStatus()).isEqualTo(StripePaymentStatus.REFUNDED);
        }

        @Test
        @DisplayName("Admin kismi iade — status PARTIALLY_REFUNDED")
        void processAdminRefund_partialRefund_statusPartiallyRefunded() throws Exception {
            Payment payment = Payment.builder()
                    .id(1L)
                    .stripePaymentIntentId("pi_admin")
                    .status(StripePaymentStatus.SUCCEEDED)
                    .amount(new BigDecimal("100.00"))
                    .build();

            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));
            when(stripeService.refundPayment(eq("pi_admin"), any())).thenReturn(mock(Refund.class));
            when(paymentRepository.findByStripePaymentIntentId("pi_admin"))
                    .thenReturn(Optional.of(payment));
            when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
            when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            BigDecimal refund = paymentService.processAdminRefund(1L, new BigDecimal("30.00"));

            assertThat(refund).isEqualByComparingTo(new BigDecimal("30.00"));
            assertThat(payment.getStatus()).isEqualTo(StripePaymentStatus.PARTIALLY_REFUNDED);
        }

        @Test
        @DisplayName("Sifir tutar iade — IllegalArgumentException firlatir")
        void processAdminRefund_zeroAmount_throwsException() {
            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

            assertThatThrownBy(() -> paymentService.processAdminRefund(1L, BigDecimal.ZERO))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("größer als 0");
        }

        @Test
        @DisplayName("TotalPrice'dan fazla iade — IllegalArgumentException firlatir")
        void processAdminRefund_exceedsTotalPrice_throwsException() {
            when(reservationRepository.findById(1L)).thenReturn(Optional.of(testReservation));

            assertThatThrownBy(() -> paymentService.processAdminRefund(1L, new BigDecimal("500.00")))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("darf den Gesamtpreis");
        }
    }
}
