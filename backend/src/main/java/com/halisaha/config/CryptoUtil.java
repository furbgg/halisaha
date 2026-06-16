package com.halisaha.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

@Slf4j
@Component
public class CryptoUtil {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int IV_LENGTH = 12;

    @Value("${totp.encryption-key:}")
    private String encryptionKeyBase64;

    private final Environment environment;
    private SecretKeySpec secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public CryptoUtil(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void init() {
        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");

        if (encryptionKeyBase64 == null || encryptionKeyBase64.isBlank()) {
            if (isProd) {
                throw new IllegalStateException(
                        "TOTP_ENCRYPTION_KEY is required in production. "
                                + "Generate with: openssl rand -base64 32");
            }
            log.warn("TOTP encryption key not configured — TOTP secrets will be stored in plain text. "
                    + "Set TOTP_ENCRYPTION_KEY environment variable for production.");
            return;
        }
        byte[] keyBytes = Base64.getDecoder().decode(encryptionKeyBase64);
        if (keyBytes.length != 32) {
            throw new IllegalStateException("TOTP encryption key must be 32 bytes (256 bits) base64-encoded.");
        }
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String plainText) {
        if (secretKey == null || plainText == null) return plainText;
        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] encrypted = cipher.doFinal(plainText.getBytes());

            byte[] combined = ByteBuffer.allocate(IV_LENGTH + encrypted.length)
                    .put(iv)
                    .put(encrypted)
                    .array();

            return "ENC:" + Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt TOTP secret", e);
        }
    }

    public String decrypt(String cipherText) {
        if (secretKey == null || cipherText == null) return cipherText;
        if (!cipherText.startsWith("ENC:")) return cipherText;
        try {
            byte[] combined = Base64.getDecoder().decode(cipherText.substring(4));
            ByteBuffer buffer = ByteBuffer.wrap(combined);

            byte[] iv = new byte[IV_LENGTH];
            buffer.get(iv);
            byte[] encrypted = new byte[buffer.remaining()];
            buffer.get(encrypted);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            return new String(cipher.doFinal(encrypted));
        } catch (Exception e) {
            throw new RuntimeException("Failed to decrypt TOTP secret", e);
        }
    }
}
