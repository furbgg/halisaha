package com.halisaha.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.halisaha.common.exception.GlobalExceptionHandler;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.payment.dto.CreatePaymentRequest;
import com.halisaha.payment.dto.PaymentResponse;
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

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentController — Ödeme Endpointleri")
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(paymentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }


    @Nested
    @DisplayName("POST /payments/create-intent")
    class CreatePaymentIntentTests {

        @Test
        @DisplayName("Basarili odeme olusturma — 200 ve PaymentResponse")
        void createIntent_success_returns200() throws Exception {
            PaymentResponse response = PaymentResponse.builder()
                    .clientSecret("pi_secret_abc")
                    .paymentIntentId("pi_123")
                    .amount(new BigDecimal("100.00"))
                    .currency("eur")
                    .status("PENDING")
                    .build();
            when(paymentService.initiatePayment(eq(1L), isNull(), eq(false), isNull()))
                    .thenReturn(response);

            CreatePaymentRequest request = new CreatePaymentRequest(1L, null, null);

            mockMvc.perform(post("/payments/create-intent")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.clientSecret").value("pi_secret_abc"))
                    .andExpect(jsonPath("$.data.paymentIntentId").value("pi_123"))
                    .andExpect(jsonPath("$.data.amount").value(100.00))
                    .andExpect(jsonPath("$.data.currency").value("eur"));
        }

        @Test
        @DisplayName("ReservationId null — 400 Bad Request")
        void createIntent_nullReservationId_returns400() throws Exception {
            String body = "{\"paymentMethod\": \"CARD\"}";

            mockMvc.perform(post("/payments/create-intent")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Rezervasyon bulunamadi — 404")
        void createIntent_reservationNotFound_returns404() throws Exception {
            when(paymentService.initiatePayment(eq(999L), isNull(), eq(false), isNull()))
                    .thenThrow(new ResourceNotFoundException("Reservierung nicht gefunden"));

            CreatePaymentRequest request = new CreatePaymentRequest(999L, null, null);

            mockMvc.perform(post("/payments/create-intent")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false));
        }
    }


    @Nested
    @DisplayName("POST /payments/{reservationId}/on-site")
    class MarkOnSiteTests {

        @Test
        @DisplayName("Basarili yerinde odeme — 200")
        void markOnSite_success_returns200() throws Exception {
            doNothing().when(paymentService).markAsOnSite(eq(1L), isNull(), eq(false));

            mockMvc.perform(post("/payments/1/on-site"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Als Vor-Ort-Zahlung markiert"));
        }

        @Test
        @DisplayName("Rezervasyon bulunamadi — 404")
        void markOnSite_notFound_returns404() throws Exception {
            doThrow(new ResourceNotFoundException("Reservierung nicht gefunden"))
                    .when(paymentService).markAsOnSite(eq(999L), isNull(), eq(false));

            mockMvc.perform(post("/payments/999/on-site"))
                    .andExpect(status().isNotFound());
        }
    }


    @Nested
    @DisplayName("POST /payments/{reservationId}/refund")
    class RefundTests {

        @Test
        @DisplayName("Basarili iade — 200 ve tutar")
        void refund_success_returns200WithAmount() throws Exception {
            when(paymentService.processRefund(1L)).thenReturn(new BigDecimal("50.00"));

            mockMvc.perform(post("/payments/1/refund"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.refundedAmount").value(50.00));
        }

        @Test
        @DisplayName("Odenmemis rezervasyon — 500 (IllegalStateException)")
        void refund_notPaid_returns500() throws Exception {
            when(paymentService.processRefund(1L))
                    .thenThrow(new IllegalStateException("Nur bezahlte Reservierungen können erstattet werden"));

            mockMvc.perform(post("/payments/1/refund"))
                    .andExpect(status().isInternalServerError());
        }
    }


    @Nested
    @DisplayName("POST /payments/admin/{reservationId}/refund")
    class AdminRefundTests {

        @Test
        @DisplayName("Admin iade — 200 ve tutar")
        void adminRefund_success_returns200() throws Exception {
            when(paymentService.processAdminRefund(eq(1L), any(BigDecimal.class)))
                    .thenReturn(new BigDecimal("30.00"));

            mockMvc.perform(post("/payments/admin/1/refund")
                            .param("amount", "30.00"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.refundedAmount").value(30.00));
        }

        @Test
        @DisplayName("Rezervasyon bulunamadi — 404")
        void adminRefund_notFound_returns404() throws Exception {
            when(paymentService.processAdminRefund(eq(999L), any(BigDecimal.class)))
                    .thenThrow(new ResourceNotFoundException("Reservierung nicht gefunden"));

            mockMvc.perform(post("/payments/admin/999/refund")
                            .param("amount", "50.00"))
                    .andExpect(status().isNotFound());
        }
    }
}
