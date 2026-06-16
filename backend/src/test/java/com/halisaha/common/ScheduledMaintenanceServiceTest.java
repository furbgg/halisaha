package com.halisaha.common;

import com.halisaha.auth.repository.LoginAttemptRepository;
import com.halisaha.payment.ReservationPaymentStatus;
import com.halisaha.reservation.ReservationStatus;
import com.halisaha.reservation.repository.ReservationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.ZonedDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScheduledMaintenanceServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private LoginAttemptRepository loginAttemptRepository;

    @InjectMocks
    private ScheduledMaintenanceService scheduledMaintenanceService;

    @Test
    void cancelStalePendingReservations_shouldCallBulkCancelWithCorrectParams() {
        when(reservationRepository.bulkCancelStalePendingReservations(
                eq(ReservationStatus.CONFIRMED),
                eq(ReservationPaymentStatus.PENDING),
                eq(ReservationStatus.CANCELLED),
                any(ZonedDateTime.class),
                eq("SYSTEM"),
                any(ZonedDateTime.class)))
                .thenReturn(3);

        scheduledMaintenanceService.cancelStalePendingReservations();

        verify(reservationRepository).bulkCancelStalePendingReservations(
                eq(ReservationStatus.CONFIRMED),
                eq(ReservationPaymentStatus.PENDING),
                eq(ReservationStatus.CANCELLED),
                any(ZonedDateTime.class),
                eq("SYSTEM"),
                any(ZonedDateTime.class));
    }

    @Test
    void cancelStalePendingReservations_shouldHandleZeroResults() {
        when(reservationRepository.bulkCancelStalePendingReservations(
                any(), any(), any(), any(ZonedDateTime.class), any(), any(ZonedDateTime.class)))
                .thenReturn(0);

        scheduledMaintenanceService.cancelStalePendingReservations();

        verify(reservationRepository).bulkCancelStalePendingReservations(
                any(), any(), any(), any(ZonedDateTime.class), any(), any(ZonedDateTime.class));
    }

    @Test
    void cleanupExpiredRateLimits_shouldCallDeleteExpiredBefore() {
        scheduledMaintenanceService.cleanupExpiredRateLimits();

        verify(loginAttemptRepository).deleteExpiredBefore(anyLong());
    }
}
