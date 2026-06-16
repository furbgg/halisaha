package com.halisaha.notification.repository;

import com.halisaha.notification.NotificationPurpose;
import com.halisaha.notification.NotificationStatus;
import com.halisaha.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.ZonedDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByReservationId(Long reservationId);

    List<Notification> findByReservationIdAndPurpose(Long reservationId, NotificationPurpose purpose);

    long countByStatus(NotificationStatus status);

    long countByReadFalse();

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.read = false")
    void markAllAsRead();

    @Query("SELECT n FROM Notification n WHERE n.status = 'FAILED' AND n.retryCount < :maxRetries AND n.nextRetryAt <= :now")
    List<Notification> findRetryable(int maxRetries, ZonedDateTime now);
}
