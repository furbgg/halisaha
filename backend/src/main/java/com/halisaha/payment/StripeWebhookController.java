package com.halisaha.payment;

import com.halisaha.common.AppConstants;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.halisaha.payment.entity.ProcessedEvent;
import com.halisaha.payment.repository.ProcessedEventRepository;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.ZonedDateTime;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final StripeService stripeService;
    private final PaymentService paymentService;
    private final ProcessedEventRepository processedEventRepository;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;
        try {
            event = stripeService.verifyWebhookSignature(payload, sigHeader);
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        Optional<StripeObject> stripeObject = event.getDataObjectDeserializer().getObject();
        if (stripeObject.isEmpty()) {
            return ResponseEntity.ok("Event ignored");
        }

        try {
            processedEventRepository.save(ProcessedEvent.builder()
                    .id(event.getId())
                    .processedAt(ZonedDateTime.now(AppConstants.VIENNA))
                    .build());
            processedEventRepository.flush();
        } catch (DataIntegrityViolationException e) {
            log.info("Webhook event {} already processed (Idempotency check)", event.getId());
            return ResponseEntity.ok("Already processed");
        }

        switch (event.getType()) {
            case "payment_intent.succeeded" -> {
                PaymentIntent pi = (PaymentIntent) stripeObject.get();
                paymentService.handlePaymentSuccess(pi.getId());
                log.info("Webhook: payment_intent.succeeded {}", pi.getId());
            }
            case "payment_intent.payment_failed" -> {
                PaymentIntent pi = (PaymentIntent) stripeObject.get();
                paymentService.handlePaymentFailure(pi.getId());
                log.info("Webhook: payment_intent.payment_failed {}", pi.getId());
            }
            default -> log.debug("Unhandled event type: {}", event.getType());
        }

        return ResponseEntity.ok("OK");
    }
}
