package com.halisaha.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * IP-based rate limiter for public (unauthenticated) endpoints.
 * Prevents spam/DoS on slot holds, reservations, coupon validation,
 * contact forms, and payment intents.
 *
 * Uses a sliding-window counter per IP with automatic cleanup.
 *
 * NOTE: This is an in-memory implementation — rate limit state is NOT shared
 * across multiple instances. For multi-instance deployments, replace with
 * Redis-based rate limiting (e.g. Bucket4j + Redis or Spring Cloud Gateway).
 * For a single-instance deployment (current setup), this is sufficient.
 */
@Slf4j
@Component
public class PublicEndpointRateLimitFilter extends OncePerRequestFilter {

    private static final Set<String> RATE_LIMITED_ENDPOINTS = Set.of(
            "POST:/api/reservations/hold",
            "DELETE:/api/reservations/hold",
            "POST:/api/reservations",
            "GET:/api/reservations/",
            "PUT:/api/reservations/",
            "DELETE:/api/reservations/",
            "POST:/api/coupons/validate",
            "POST:/api/contact",
            "POST:/api/payments/create-intent"
    );

    private static final int MAX_REQUESTS = 30;
    private static final long WINDOW_MS = 60_000L;
    private static final long CLEANUP_INTERVAL_MS = 5 * 60_000L;

    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();
    private volatile long lastCleanup = System.currentTimeMillis();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String method = request.getMethod();
        String path = request.getRequestURI();
        String key = method + ":" + path;

        boolean shouldLimit = RATE_LIMITED_ENDPOINTS.stream()
                .anyMatch(ep -> key.startsWith(ep) || key.equals(ep));

        if (!shouldLimit) {
            filterChain.doFilter(request, response);
            return;
        }

        long now = System.currentTimeMillis();
        if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
            lastCleanup = now;
            counters.entrySet().removeIf(e -> e.getValue().isExpired(now));
        }

        String clientIp = extractClientIp(request);
        String rateLimitKey = clientIp + "|" + method + ":" + normalizePath(path);

        WindowCounter counter = counters.computeIfAbsent(rateLimitKey, k -> new WindowCounter(now));

        if (counter.isExpired(now)) {
            counter.reset(now);
        }

        int count = counter.incrementAndGet();

        response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, MAX_REQUESTS - count)));
        response.setHeader("X-RateLimit-Reset",
                String.valueOf((counter.windowStart + WINDOW_MS - now) / 1000));

        if (count > MAX_REQUESTS) {
            long retryAfter = (counter.windowStart + WINDOW_MS - now) / 1000;
            response.setHeader("Retry-After", String.valueOf(retryAfter));
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Zu viele Anfragen. Bitte versuchen Sie es in "
                            + retryAfter + " Sekunden erneut.\"}");
            log.warn("Rate limit exceeded for IP {} on endpoint {} ({} requests)",
                    clientIp, key, count);
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Normalize paths like /reservations/hold/abc123 → /reservations/hold
     * so that dynamic path segments don't create separate counters.
     */
    private String normalizePath(String path) {
        if (path.startsWith("/api/reservations/hold/")) return "/api/reservations/hold";
        return path;
    }

    private String extractClientIp(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    private static class WindowCounter {
        volatile long windowStart;
        private final AtomicInteger count = new AtomicInteger(0);

        WindowCounter(long windowStart) {
            this.windowStart = windowStart;
        }

        int incrementAndGet() {
            return count.incrementAndGet();
        }

        boolean isExpired(long now) {
            return now - windowStart > WINDOW_MS;
        }

        void reset(long now) {
            windowStart = now;
            count.set(0);
        }
    }
}
