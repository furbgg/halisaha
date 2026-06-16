package com.halisaha.payment;

import com.halisaha.common.exception.GlobalExceptionHandler;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("StripeWebhookController — Webhook İşleme")
class StripeWebhookControllerTest {

        @Mock
        private StripeService stripeService;
        @Mock
        private PaymentService paymentService;
        @Mock
        private com.halisaha.payment.repository.ProcessedEventRepository processedEventRepository;

        @InjectMocks
        private StripeWebhookController webhookController;

        private MockMvc mockMvc;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.standaloneSetup(webhookController)
                                .setControllerAdvice(new GlobalExceptionHandler())
                                .build();
        }

        private Event createMockEvent(String eventType, String paymentIntentId) {
                PaymentIntent pi = mock(PaymentIntent.class);
                when(pi.getId()).thenReturn(paymentIntentId);

                EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
                when(deserializer.getObject()).thenReturn(Optional.of(pi));

                Event event = mock(Event.class);
                when(event.getType()).thenReturn(eventType);
                when(event.getId()).thenReturn("evt_mock_" + paymentIntentId);
                when(event.getDataObjectDeserializer()).thenReturn(deserializer);

                return event;
        }


        @Nested
        @DisplayName("POST /payments/webhook")
        class HandleWebhookTests {

                @Test
                @DisplayName("payment_intent.succeeded — handlePaymentSuccess cagirilir")
                void webhook_paymentSucceeded_callsHandleSuccess() throws Exception {
                        Event event = createMockEvent("payment_intent.succeeded", "pi_success_123");
                        when(stripeService.verifyWebhookSignature("test_payload", "test_sig"))
                                        .thenReturn(event);

                        mockMvc.perform(post("/payments/webhook")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("test_payload")
                                        .header("Stripe-Signature", "test_sig"))
                                        .andExpect(status().isOk())
                                        .andExpect(content().string("OK"));

                        verify(paymentService).handlePaymentSuccess("pi_success_123");
                        verify(paymentService, never()).handlePaymentFailure(anyString());
                }

                @Test
                @DisplayName("payment_intent.payment_failed — handlePaymentFailure cagirilir")
                void webhook_paymentFailed_callsHandleFailure() throws Exception {
                        Event event = createMockEvent("payment_intent.payment_failed", "pi_fail_456");
                        when(stripeService.verifyWebhookSignature("test_payload", "test_sig"))
                                        .thenReturn(event);

                        mockMvc.perform(post("/payments/webhook")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("test_payload")
                                        .header("Stripe-Signature", "test_sig"))
                                        .andExpect(status().isOk())
                                        .andExpect(content().string("OK"));

                        verify(paymentService).handlePaymentFailure("pi_fail_456");
                        verify(paymentService, never()).handlePaymentSuccess(anyString());
                }

        @Test
        @DisplayName("Gecersiz imza — 400 Bad Request")
        void webhook_invalidSignature_returns400() throws Exception {
            when(stripeService.verifyWebhookSignature("bad_payload", "bad_sig"))
                    .thenThrow(new SignatureVerificationException("Invalid signature", "sig"));

            mockMvc.perform(post("/payments/webhook")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("bad_payload")
                            .header("Stripe-Signature", "bad_sig"))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Invalid signature"));

            verify(paymentService, never()).handlePaymentSuccess(anyString());
            verify(paymentService, never()).handlePaymentFailure(anyString());
        }

                @Test
                @DisplayName("Bilinmeyen event type — OK doner ama islem yapilmaz")
                void webhook_unknownEventType_returnsOkNoAction() throws Exception {
                        Event event = mock(Event.class);
                        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
                        when(deserializer.getObject()).thenReturn(Optional.of(mock(StripeObject.class)));
                        when(event.getType()).thenReturn("charge.refunded");
                        when(event.getId()).thenReturn("evt_unknown");
                        when(event.getDataObjectDeserializer()).thenReturn(deserializer);

                        when(stripeService.verifyWebhookSignature("payload", "sig"))
                                        .thenReturn(event);

                        mockMvc.perform(post("/payments/webhook")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("payload")
                                        .header("Stripe-Signature", "sig"))
                                        .andExpect(status().isOk())
                                        .andExpect(content().string("OK"));

                        verify(paymentService, never()).handlePaymentSuccess(anyString());
                        verify(paymentService, never()).handlePaymentFailure(anyString());
                }

                @Test
                @DisplayName("Bos data object — Event ignored doner")
                void webhook_emptyDataObject_returnsIgnored() throws Exception {
                        Event event = mock(Event.class);
                        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
                        when(deserializer.getObject()).thenReturn(Optional.empty());
                        when(event.getDataObjectDeserializer()).thenReturn(deserializer);

                        when(stripeService.verifyWebhookSignature("payload", "sig"))
                                        .thenReturn(event);

                        mockMvc.perform(post("/payments/webhook")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("payload")
                                        .header("Stripe-Signature", "sig"))
                                        .andExpect(status().isOk())
                                        .andExpect(content().string("Event ignored"));

                        verify(paymentService, never()).handlePaymentSuccess(anyString());
                        verify(paymentService, never()).handlePaymentFailure(anyString());
                }

                @Test
                @DisplayName("Stripe-Signature header eksik — 400")
                void webhook_missingSignatureHeader_returns400() throws Exception {
                        mockMvc.perform(post("/payments/webhook")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content("payload"))
                                        .andExpect(status().isBadRequest());
                }
        }
}
