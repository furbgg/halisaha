package com.halisaha.auth;

import com.halisaha.auth.entity.LoginAttempt;
import com.halisaha.auth.repository.LoginAttemptRepository;
import com.halisaha.common.exception.RateLimitExceededException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * IP-based rate limiter with dual storage:
 * - ConcurrentHashMap for fast in-memory lookups
 * - DB persistence to survive application restarts
 */
@Slf4j
@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MILLIS = 15 * 60 * 1000;

    private final Map<String, AttemptRecord> attempts = new ConcurrentHashMap<>();
    private final LoginAttemptRepository repository;

    @Autowired
    public LoginRateLimiter(LoginAttemptRepository repository) {
        this.repository = repository;
    }

    LoginRateLimiter() {
        this.repository = null;
    }

    @PostConstruct
    public void loadFromDb() {
        if (repository == null) return;
        try {
            long cutoff = System.currentTimeMillis() - WINDOW_MILLIS;
            repository.findByWindowStartMillisGreaterThan(cutoff).forEach(entity ->
                    attempts.put(entity.getRateKey(),
                            new AttemptRecord(entity.getAttemptCount(), entity.getWindowStartMillis()))
            );
            log.info("Loaded {} active rate limit entries from DB", attempts.size());
        } catch (Exception e) {
            log.warn("Could not load rate limits from DB: {}", e.getMessage());
        }
    }

    public void checkRateLimit(String key) {
        cleanup();
        AttemptRecord record = attempts.get(key);
        if (record != null && record.count >= MAX_ATTEMPTS && !record.isExpired()) {
            long remainingSeconds = (record.windowStart + WINDOW_MILLIS - System.currentTimeMillis()) / 1000;
            throw new RateLimitExceededException(
                    "Zu viele Anmeldeversuche. Bitte versuchen Sie es in " + remainingSeconds + " Sekunden erneut.");
        }
    }

    @Transactional
    public void recordAttempt(String key) {
        attempts.compute(key, (k, existing) -> {
            if (existing == null || existing.isExpired()) {
                return new AttemptRecord(1, System.currentTimeMillis());
            }
            existing.count++;
            return existing;
        });
        persistToDb(key);
    }

    @Transactional
    public void resetAttempts(String key) {
        attempts.remove(key);
        deleteFromDb(key);
    }

    private void cleanup() {
        attempts.entrySet().removeIf(e -> e.getValue().isExpired());
    }

    private void persistToDb(String key) {
        if (repository == null) return;
        try {
            AttemptRecord record = attempts.get(key);
            if (record == null) return;

            LoginAttempt entity = repository.findByRateKey(key)
                    .orElse(LoginAttempt.builder().rateKey(key).build());
            entity.setAttemptCount(record.count);
            entity.setWindowStartMillis(record.windowStart);
            repository.save(entity);
        } catch (Exception e) {
            log.warn("Could not persist rate limit to DB: {}", e.getMessage());
        }
    }

    private void deleteFromDb(String key) {
        if (repository == null) return;
        try {
            repository.deleteByRateKey(key);
        } catch (Exception e) {
            log.warn("Could not delete rate limit from DB: {}", e.getMessage());
        }
    }

    private static class AttemptRecord {
        int count;
        long windowStart;

        AttemptRecord(int count, long windowStart) {
            this.count = count;
            this.windowStart = windowStart;
        }

        boolean isExpired() {
            return Instant.now().toEpochMilli() > windowStart + WINDOW_MILLIS;
        }
    }
}
