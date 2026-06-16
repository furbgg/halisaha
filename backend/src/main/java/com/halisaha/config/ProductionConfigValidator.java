package com.halisaha.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class ProductionConfigValidator {

    private final Environment environment;

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${spring.datasource.password:}")
    private String dbPassword;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret:}")
    private String stripeWebhookSecret;

    @Value("${totp.encryption-key:}")
    private String totpEncryptionKey;

    @PostConstruct
    public void validate() {
        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        if (!isProd) {
            return;
        }

        assertSafe("JWT_SECRET", jwtSecret);
        if (jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 bytes in production.");
        }

        assertSafe("DB_PASSWORD", dbPassword);
        assertSafe("STRIPE_SECRET_KEY", stripeSecretKey);
        assertSafe("STRIPE_WEBHOOK_SECRET", stripeWebhookSecret);
        assertSafe("TOTP_ENCRYPTION_KEY", totpEncryptionKey);
    }

    private void assertSafe(String name, String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(name + " is required in production.");
        }

        String normalized = value.toLowerCase(Locale.ROOT).trim();
        List<String> forbidden = List.of(
                "change_me",
                "placeholder",
                "dev_password",
                "dev-secret",
                "example",
                "test_",
                "test-");

        for (String marker : forbidden) {
            if (normalized.contains(marker)) {
                throw new IllegalStateException(name + " contains an unsafe default marker: " + marker);
            }
        }
    }
}
