package com.halisaha.common;

import com.halisaha.auth.repository.LoginAttemptRepository;
import com.halisaha.payment.ReservationPaymentStatus;
import com.halisaha.reservation.ReservationStatus;
import com.halisaha.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;

/**
 * Scheduled maintenance tasks for data hygiene and consistency.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduledMaintenanceService {

    private final ReservationRepository reservationRepository;
    private final LoginAttemptRepository loginAttemptRepository;

    /**
     * Cancel reservations stuck in PENDING payment for > 30 minutes.
     * Runs every 5 minutes.
     */
    @Scheduled(fixedRate = 300_000)
    @Transactional
    public void cancelStalePendingReservations() {
        ZonedDateTime now = ZonedDateTime.now(AppConstants.VIENNA);
        ZonedDateTime cutoff = now.minusMinutes(30);

        int count = reservationRepository.bulkCancelStalePendingReservations(
                ReservationStatus.CONFIRMED,
                ReservationPaymentStatus.PENDING,
                ReservationStatus.CANCELLED,
                now,
                "SYSTEM",
                cutoff);
        if (count > 0) {
            log.info("Cancelled {} stale PENDING reservations (>30min without payment)", count);
        }
    }

    /**
     * Remove expired rate limit entries from the database.
     * Runs daily at 04:00.
     */
    @Scheduled(cron = "0 0 4 * * *")
    @Transactional
    public void cleanupExpiredRateLimits() {
        long cutoffMillis = System.currentTimeMillis() - (15 * 60 * 1000);
        loginAttemptRepository.deleteExpiredBefore(cutoffMillis);
        log.debug("Rate limit cleanup completed");
    }
}
