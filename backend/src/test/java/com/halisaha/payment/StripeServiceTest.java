package com.halisaha.payment;

import com.halisaha.payment.config.StripeConfig;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StripeService — Stripe API Entegrasyonu")
class StripeServiceTest {

    @Mock
    private StripeConfig stripeConfig;

    @InjectMocks
    private StripeService stripeService;


    @Nested
    @DisplayName("createPaymentIntent")
    class CreatePaymentIntentTests {

        @Test
        @DisplayName("Dogru tutar (BigDecimal → cents) ve metadata ile PaymentIntent olusturulur")
        void createPaymentIntent_convertsAmountAndSetsMetadata() throws Exception {
            when(stripeConfig.getCurrency()).thenReturn("eur");

            PaymentIntent mockIntent = mock(PaymentIntent.class);
            when(mockIntent.getId()).thenReturn("pi_test_123");

            ArgumentCaptor<PaymentIntentCreateParams> captor =
                    ArgumentCaptor.forClass(PaymentIntentCreateParams.class);

            try (MockedStatic<PaymentIntent> piStatic = mockStatic(PaymentIntent.class)) {
                piStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class), any(com.stripe.net.RequestOptions.class)))
                        .thenReturn(mockIntent);

                PaymentIntent result = stripeService.createPaymentIntent(
                        new BigDecimal("75.50"), 42L);

                assertThat(result.getId()).isEqualTo("pi_test_123");

                piStatic.verify(() -> PaymentIntent.create(captor.capture(), any(com.stripe.net.RequestOptions.class)));
                PaymentIntentCreateParams params = captor.getValue();
                assertThat(params.getAmount()).isEqualTo(7550L);
                assertThat(params.getCurrency()).isEqualTo("eur");
                assertThat(params.getMetadata().get("reservation_id")).isEqualTo("42");
            }
        }

        @Test
        @DisplayName("Kucuk tutar (1.00 EUR = 100 cents) donusumu dogru")
        void createPaymentIntent_smallAmount_correctConversion() throws Exception {
            when(stripeConfig.getCurrency()).thenReturn("eur");

            PaymentIntent mockIntent = mock(PaymentIntent.class);
            ArgumentCaptor<PaymentIntentCreateParams> captor =
                    ArgumentCaptor.forClass(PaymentIntentCreateParams.class);

            try (MockedStatic<PaymentIntent> piStatic = mockStatic(PaymentIntent.class)) {
                piStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class), any(com.stripe.net.RequestOptions.class)))
                        .thenReturn(mockIntent);

                stripeService.createPaymentIntent(new BigDecimal("1.00"), 1L);

                piStatic.verify(() -> PaymentIntent.create(captor.capture(), any(com.stripe.net.RequestOptions.class)));
                assertThat(captor.getValue().getAmount()).isEqualTo(100L);
            }
        }

        @Test
        @DisplayName("Buyuk tutar (999.99 EUR = 99999 cents) donusumu dogru")
        void createPaymentIntent_largeAmount_correctConversion() throws Exception {
            when(stripeConfig.getCurrency()).thenReturn("eur");

            PaymentIntent mockIntent = mock(PaymentIntent.class);
            ArgumentCaptor<PaymentIntentCreateParams> captor =
                    ArgumentCaptor.forClass(PaymentIntentCreateParams.class);

            try (MockedStatic<PaymentIntent> piStatic = mockStatic(PaymentIntent.class)) {
                piStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class), any(com.stripe.net.RequestOptions.class)))
                        .thenReturn(mockIntent);

                stripeService.createPaymentIntent(new BigDecimal("999.99"), 1L);

                piStatic.verify(() -> PaymentIntent.create(captor.capture(), any(com.stripe.net.RequestOptions.class)));
                assertThat(captor.getValue().getAmount()).isEqualTo(99999L);
            }
        }
    }


    @Nested
    @DisplayName("refundPayment")
    class RefundPaymentTests {

        @Test
        @DisplayName("Dogru tutar ve paymentIntentId ile Refund olusturulur")
        void refundPayment_createsRefundWithCorrectParams() throws Exception {
            Refund mockRefund = mock(Refund.class);
            when(mockRefund.getId()).thenReturn("re_test_456");

            ArgumentCaptor<RefundCreateParams> captor = ArgumentCaptor.forClass(RefundCreateParams.class);

            try (MockedStatic<Refund> refundStatic = mockStatic(Refund.class)) {
                refundStatic.when(
                        () -> Refund.create(any(RefundCreateParams.class), any(com.stripe.net.RequestOptions.class)))
                        .thenReturn(mockRefund);

                Refund result = stripeService.refundPayment("pi_test_123", new BigDecimal("50.00"));

                assertThat(result.getId()).isEqualTo("re_test_456");

                refundStatic.verify(() -> Refund.create(captor.capture(), any(com.stripe.net.RequestOptions.class)));
                RefundCreateParams params = captor.getValue();
                assertThat(params.getPaymentIntent()).isEqualTo("pi_test_123");
                assertThat(params.getAmount()).isEqualTo(5000L);
            }
        }

        @Test
        @DisplayName("Kucuk iade tutari (0.50 EUR = 50 cents)")
        void refundPayment_smallAmount_correctConversion() throws Exception {
            Refund mockRefund = mock(Refund.class);
            ArgumentCaptor<RefundCreateParams> captor = ArgumentCaptor.forClass(RefundCreateParams.class);

            try (MockedStatic<Refund> refundStatic = mockStatic(Refund.class)) {
                refundStatic.when(
                        () -> Refund.create(any(RefundCreateParams.class), any(com.stripe.net.RequestOptions.class)))
                        .thenReturn(mockRefund);

                stripeService.refundPayment("pi_test", new BigDecimal("0.50"));

                refundStatic.verify(() -> Refund.create(captor.capture(), any(com.stripe.net.RequestOptions.class)));
                assertThat(captor.getValue().getAmount()).isEqualTo(50L);
            }
        }
    }


    @Nested
    @DisplayName("verifyWebhookSignature")
    class VerifyWebhookSignatureTests {

        @Test
        @DisplayName("Gecerli imza ile Event doner")
        void verifyWebhookSignature_validSignature_returnsEvent() throws Exception {
            when(stripeConfig.getWebhookSecret()).thenReturn("whsec_test");

            Event mockEvent = mock(Event.class);
            try (MockedStatic<Webhook> webhookStatic = mockStatic(Webhook.class)) {
                webhookStatic.when(() -> Webhook.constructEvent("payload", "sig_header", "whsec_test"))
                        .thenReturn(mockEvent);

                Event result = stripeService.verifyWebhookSignature("payload", "sig_header");

                assertThat(result).isEqualTo(mockEvent);
            }
        }

        @Test
        @DisplayName("Gecersiz imza — SignatureVerificationException firlatir")
        void verifyWebhookSignature_invalidSignature_throwsException() throws Exception {
            when(stripeConfig.getWebhookSecret()).thenReturn("whsec_test");

            try (MockedStatic<Webhook> webhookStatic = mockStatic(Webhook.class)) {
                webhookStatic.when(() -> Webhook.constructEvent("payload", "bad_sig", "whsec_test"))
                        .thenThrow(new SignatureVerificationException("Invalid", "sig_header"));

                assertThatThrownBy(() ->
                        stripeService.verifyWebhookSignature("payload", "bad_sig"))
                        .isInstanceOf(SignatureVerificationException.class);
            }
        }
    }
}
