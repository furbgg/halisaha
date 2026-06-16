package com.halisaha.auth;

import com.halisaha.auth.entity.ActiveSession;
import com.halisaha.auth.repository.ActiveSessionRepository;
import com.halisaha.common.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.ZonedDateTime;
import java.util.HexFormat;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionService {

    private final ActiveSessionRepository sessionRepository;

    /**
     * Create a new session record after successful login.
     */
    @Transactional
    public ActiveSession createSession(Long userId, String refreshToken, String userAgent, String ipAddress) {
        String hash = hashToken(refreshToken);
        String deviceInfo = parseUserAgent(userAgent);

        ActiveSession session = ActiveSession.builder()
                .userId(userId)
                .tokenHash(hash)
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .lastUsedAt(ZonedDateTime.now(AppConstants.VIENNA))
                .revoked(false)
                .build();

        return sessionRepository.save(session);
    }

    /**
     * Get all active (non-revoked) sessions for a user.
     */
    @Transactional(readOnly = true)
    public List<ActiveSession> getActiveSessions(Long userId) {
        return sessionRepository.findByUserIdAndRevokedFalseOrderByLastUsedAtDesc(userId);
    }

    /**
     * Check if a refresh token has been revoked.
     */
    @Transactional(readOnly = true)
    public boolean isTokenRevoked(String refreshToken) {
        String hash = hashToken(refreshToken);
        return sessionRepository.findByTokenHashAndRevokedFalse(hash).isEmpty();
    }

    /**
     * Update last_used_at for a session on token refresh.
     */
    @Transactional
    public void updateLastUsed(String refreshToken) {
        String hash = hashToken(refreshToken);
        sessionRepository.findByTokenHashAndRevokedFalse(hash).ifPresent(session -> {
            session.setLastUsedAt(ZonedDateTime.now(AppConstants.VIENNA));
            sessionRepository.save(session);
        });
    }

    /**
     * Revoke old refresh token session (used during token rotation).
     */
    @Transactional
    public void rotateToken(String oldRefreshToken, Long userId) {
        String hash = hashToken(oldRefreshToken);
        sessionRepository.findByTokenHashAndRevokedFalse(hash).ifPresent(session -> {
            session.setRevoked(true);
            sessionRepository.save(session);
        });
    }

    /**
     * Revoke a specific refresh token session.
     */
    @Transactional
    public void revokeByRefreshToken(String refreshToken) {
        String hash = hashToken(refreshToken);
        sessionRepository.findByTokenHashAndRevokedFalse(hash).ifPresent(session -> {
            session.setRevoked(true);
            sessionRepository.save(session);
        });
    }

    /**
     * Create a new session from a refresh token rotation, copying device info from old session.
     */
    @Transactional
    public ActiveSession createSessionFromRefresh(Long userId, String newRefreshToken, String oldRefreshToken) {
        String oldHash = hashToken(oldRefreshToken);
        String newHash = hashToken(newRefreshToken);

        var oldSession = sessionRepository.findByTokenHash(oldHash).orElse(null);
        String deviceInfo = oldSession != null ? oldSession.getDeviceInfo() : "Unbekanntes Gerät";
        String ipAddress = oldSession != null ? oldSession.getIpAddress() : null;

        ActiveSession session = ActiveSession.builder()
                .userId(userId)
                .tokenHash(newHash)
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .lastUsedAt(ZonedDateTime.now(AppConstants.VIENNA))
                .revoked(false)
                .build();

        return sessionRepository.save(session);
    }

    /**
     * Revoke a single session by ID.
     */
    @Transactional
    public boolean revokeSession(Long sessionId, Long currentUserId) {
        return sessionRepository.findById(sessionId)
                .filter(s -> s.getUserId().equals(currentUserId) && !s.getRevoked())
                .map(s -> {
                    s.setRevoked(true);
                    sessionRepository.save(s);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Revoke all sessions except the current one.
     */
    @Transactional
    public int revokeAllOtherSessions(Long userId, String currentRefreshToken) {
        String currentHash = hashToken(currentRefreshToken);
        return sessionRepository.revokeAllOtherSessions(userId, currentHash);
    }

    /**
     * Clean up revoked sessions older than 7 days.
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredSessions() {
        ZonedDateTime cutoff = ZonedDateTime.now(AppConstants.VIENNA).minusDays(7);
        int deleted = sessionRepository.deleteRevokedBefore(cutoff);
        if (deleted > 0) {
            log.info("Cleaned up {} expired revoked sessions", deleted);
        }
    }

    /**
     * Hash a token using SHA-256 for storage (never store raw tokens).
     */
    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    /**
     * Extract a human-readable device description from User-Agent header.
     */
    private String parseUserAgent(String userAgent) {
        if (userAgent == null || userAgent.isBlank())
            return "Unbekanntes Gerät";

        String browser = "Browser";
        String os = "Unbekannt";

        if (userAgent.contains("OPR/") || userAgent.contains("Opera"))
            browser = "Opera";
        else if (userAgent.contains("Edg/"))
            browser = "Edge";
        else if (userAgent.contains("Chrome/"))
            browser = "Chrome";
        else if (userAgent.contains("Firefox/"))
            browser = "Firefox";
        else if (userAgent.contains("Safari/"))
            browser = "Safari";

        if (userAgent.contains("Windows"))
            os = "Windows";
        else if (userAgent.contains("Macintosh") || userAgent.contains("Mac OS"))
            os = "macOS";
        else if (userAgent.contains("Linux") && !userAgent.contains("Android"))
            os = "Linux";
        else if (userAgent.contains("Android"))
            os = "Android";
        else if (userAgent.contains("iPhone") || userAgent.contains("iPad"))
            os = "iOS";

        return browser + " — " + os;
    }
}
