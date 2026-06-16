package com.halisaha.payment;

import com.halisaha.payment.config.StripeConfig;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.stripe.net.RequestOptions;
import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripeService {

    private final StripeConfig stripeConfig;

    public PaymentIntent createPaymentIntent(BigDecimal amount, Long reservationId) throws StripeException {
        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(stripeConfig.getCurrency())
                .putMetadata("reservation_id", String.valueOf(reservationId))
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build())
                .build();

        RequestOptions requestOptions = RequestOptions.builder()
                .setIdempotencyKey("create_pi_" + reservationId + "_" + amountInCents)
                .build();

        PaymentIntent intent = PaymentIntent.create(params, requestOptions);
        log.info("PaymentIntent created: {} for reservation {}", intent.getId(), reservationId);
        return intent;
    }

    public Refund refundPayment(String paymentIntentId, BigDecimal amount) throws StripeException {
        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

        RefundCreateParams params = RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId)
                .setAmount(amountInCents)
                .build();

        RequestOptions requestOptions = RequestOptions.builder()
                .setIdempotencyKey("refund_" + paymentIntentId + "_" + amountInCents)
                .build();

        Refund refund = Refund.create(params, requestOptions);
        log.info("Refund created: {} for PI {} amount {}", refund.getId(), paymentIntentId, amount);
        return refund;
    }

    public Event verifyWebhookSignature(String payload, String sigHeader) throws SignatureVerificationException {
        return Webhook.constructEvent(payload, sigHeader, stripeConfig.getWebhookSecret());
    }
}
