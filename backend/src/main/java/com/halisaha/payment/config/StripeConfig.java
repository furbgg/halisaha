package com.halisaha.payment.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Slf4j
@Configuration
@Getter
public class StripeConfig {

    @Value("${stripe.secret-key:}")
    private String secretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${stripe.currency:eur}")
    private String currency;

    private final Environment environment;

    public StripeConfig(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void init() {
        boolean isProd = java.util.Arrays.asList(environment.getActiveProfiles()).contains("prod");

        if (secretKey.isBlank() || secretKey.contains("placeholder")) {
            if (isProd) {
                throw new IllegalStateException("Stripe secret key is not configured. Set STRIPE_SECRET_KEY environment variable.");
            }
            log.warn("⚠ Stripe secret key is not configured. Payments will not work. Set STRIPE_SECRET_KEY environment variable.");
            return;
        }

        if (webhookSecret.isBlank() || webhookSecret.contains("placeholder")) {
            if (isProd) {
                throw new IllegalStateException("Stripe webhook secret is not configured. Set STRIPE_WEBHOOK_SECRET environment variable.");
            }
            log.warn("⚠ Stripe webhook secret is not configured. Set STRIPE_WEBHOOK_SECRET environment variable.");
        }

        Stripe.apiKey = secretKey;
    }
}
