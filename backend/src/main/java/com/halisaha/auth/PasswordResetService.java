package com.halisaha.auth;

import com.halisaha.auth.entity.PasswordResetToken;
import com.halisaha.auth.repository.PasswordResetTokenRepository;
import com.halisaha.common.AppConstants;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.user.entity.User;
import com.halisaha.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int TOKEN_EXPIRY_HOURS = 1;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Creates a password reset token for the given email.
     * Returns the token string if user exists, null otherwise (to prevent email enumeration).
     */
    @Transactional
    public String createResetToken(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim()).orElse(null);

        if (user == null || !user.getActive()) {
            log.info("Password reset requested for unknown/inactive account");
            return null;
        }

        tokenRepository.invalidateAllTokensForUser(user.getId());

        String token = generateSecureToken();
        String tokenHash = hashToken(token);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(ZonedDateTime.now(AppConstants.VIENNA).plusHours(TOKEN_EXPIRY_HOURS))
                .used(false)
                .build();

        tokenRepository.save(resetToken);
        log.info("Password reset token created for user ID: {}", user.getId());

        return token;
    }

    /**
     * Returns the email associated with a valid token, or null if invalid/expired.
     */
    @Transactional(readOnly = true)
    public String validateToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByTokenHashAndUsedFalse(hashToken(token)).orElse(null);

        if (resetToken == null || resetToken.isExpired()) {
            return null;
        }

        return resetToken.getUser().getEmail();
    }

    /**
     * Resets the password using a valid token.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByTokenHashAndUsedFalse(hashToken(token))
                .orElseThrow(() -> new ResourceNotFoundException("Ungültiger oder abgelaufener Token"));

        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("Der Token ist abgelaufen. Bitte fordern Sie einen neuen an.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        tokenRepository.invalidateAllTokensForUser(user.getId());

        log.info("Password reset completed for user ID: {}", user.getId());
    }

    /**
     * Cleanup expired tokens (called by scheduler).
     */
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredTokens(ZonedDateTime.now(AppConstants.VIENNA));
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    /**
     * Generates a secure random password for admin invitations.
     */
    public String generateSecurePassword() {
        String upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        String lower = "abcdefghjkmnpqrstuvwxyz";
        String digits = "23456789";
        String special = "!@#$%&*+-_";
        String all = upper + lower + digits + special;

        StringBuilder sb = new StringBuilder(16);
        sb.append(upper.charAt(SECURE_RANDOM.nextInt(upper.length())));
        sb.append(lower.charAt(SECURE_RANDOM.nextInt(lower.length())));
        sb.append(digits.charAt(SECURE_RANDOM.nextInt(digits.length())));
        sb.append(special.charAt(SECURE_RANDOM.nextInt(special.length())));

        for (int i = 4; i < 16; i++) {
            sb.append(all.charAt(SECURE_RANDOM.nextInt(all.length())));
        }

        char[] chars = sb.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = SECURE_RANDOM.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }

        return new String(chars);
    }
}
