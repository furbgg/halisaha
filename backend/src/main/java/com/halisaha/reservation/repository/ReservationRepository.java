package com.halisaha.reservation.repository;

import com.halisaha.payment.ReservationPaymentStatus;
import com.halisaha.reservation.ReservationStatus;
import com.halisaha.reservation.entity.Reservation;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

       @EntityGraph(attributePaths = {"field", "user"})
       Optional<Reservation> findByConfirmationCode(String confirmationCode);

       @Lock(LockModeType.PESSIMISTIC_WRITE)
       @Query("SELECT r FROM Reservation r WHERE r.field.id = :fieldId " +
                     "AND r.startTime < :endTime AND r.endTime > :startTime " +
                     "AND r.status <> 'CANCELLED'")
       List<Reservation> findConflictingReservations(@Param("fieldId") Long fieldId,
                     @Param("startTime") ZonedDateTime startTime,
                     @Param("endTime") ZonedDateTime endTime);

       @EntityGraph(attributePaths = {"field", "user"})
       @Query("SELECT r FROM Reservation r WHERE r.field.id = :fieldId " +
                     "AND r.startTime >= :dayStart AND r.startTime < :dayEnd " +
                     "AND r.status <> 'CANCELLED'")
       List<Reservation> findActiveByFieldAndDate(@Param("fieldId") Long fieldId,
                     @Param("dayStart") ZonedDateTime dayStart,
                     @Param("dayEnd") ZonedDateTime dayEnd);

       @EntityGraph(attributePaths = {"field", "user"})
       @Query("SELECT r FROM Reservation r WHERE r.startTime >= :dayStart " +
                     "AND r.startTime < :dayEnd ORDER BY r.startTime ASC")
       List<Reservation> findByDate(@Param("dayStart") ZonedDateTime dayStart,
                     @Param("dayEnd") ZonedDateTime dayEnd);

       @EntityGraph(attributePaths = {"field", "user"})
       @Query("SELECT r FROM Reservation r WHERE r.startTime >= :from " +
                     "AND r.startTime < :to")
       List<Reservation> findByDateRange(@Param("from") ZonedDateTime from,
                     @Param("to") ZonedDateTime to);

       @Modifying(clearAutomatically = true, flushAutomatically = true)
       @Query("UPDATE Reservation r SET r.status = :cancelledStatus, r.cancelledAt = :cancelledAt, r.cancelledBy = :cancelledBy " +
                     "WHERE r.status = :confirmedStatus AND r.paymentStatus = :pendingStatus AND r.createdAt < :cutoff")
       int bulkCancelStalePendingReservations(
                     @Param("confirmedStatus") ReservationStatus confirmedStatus,
                     @Param("pendingStatus") ReservationPaymentStatus pendingStatus,
                     @Param("cancelledStatus") ReservationStatus cancelledStatus,
                     @Param("cancelledAt") ZonedDateTime cancelledAt,
                     @Param("cancelledBy") String cancelledBy,
                     @Param("cutoff") ZonedDateTime cutoff);

       @EntityGraph(attributePaths = {"field", "user"})
       @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId " +
                     "ORDER BY r.startTime DESC")
       List<Reservation> findByUserId(@Param("userId") Long userId);

       @EntityGraph(attributePaths = {"field", "user"})
       Page<Reservation> findByStatus(ReservationStatus status, Pageable pageable);

       @EntityGraph(attributePaths = {"field", "user"})
       @Query("SELECT r FROM Reservation r WHERE r.startTime >= :from AND r.startTime < :to " +
                     "AND r.status = 'CONFIRMED' AND r.notificationConsent = true")
       List<Reservation> findUpcomingForReminder(@Param("from") ZonedDateTime from,
                     @Param("to") ZonedDateTime to);

       @Query("SELECT COALESCE(SUM(r.durationMinutes), 0) FROM Reservation r " +
                     "WHERE r.user.id = :userId " +
                     "AND r.startTime >= :dayStart AND r.startTime < :dayEnd " +
                     "AND r.status <> 'CANCELLED'")
       int sumDurationByUserAndDate(@Param("userId") Long userId,
                     @Param("dayStart") ZonedDateTime dayStart,
                     @Param("dayEnd") ZonedDateTime dayEnd);

       @Query("SELECT COALESCE(SUM(r.durationMinutes), 0) FROM Reservation r " +
                     "WHERE LOWER(r.guestEmail) = LOWER(:guestEmail) " +
                     "AND r.startTime >= :dayStart AND r.startTime < :dayEnd " +
                     "AND r.status <> 'CANCELLED'")
       int sumDurationByGuestEmailAndDate(@Param("guestEmail") String guestEmail,
                     @Param("dayStart") ZonedDateTime dayStart,
                     @Param("dayEnd") ZonedDateTime dayEnd);

       @Query("SELECT COUNT(r) FROM Reservation r WHERE r.startTime >= :from AND r.startTime < :to " +
                     "AND r.status <> 'CANCELLED'")
       long countByDateRange(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

       @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM Reservation r WHERE r.startTime >= :from " +
                     "AND r.startTime < :to AND r.status <> 'CANCELLED'")
       java.math.BigDecimal sumRevenueByDateRange(@Param("from") ZonedDateTime from,
                     @Param("to") ZonedDateTime to);

       @Query("SELECT r.field.id, r.field.name, COUNT(r), COALESCE(SUM(r.totalPrice), 0) " +
                     "FROM Reservation r WHERE r.startTime >= :from AND r.startTime < :to " +
                     "AND r.status <> 'CANCELLED' GROUP BY r.field.id, r.field.name ORDER BY COUNT(r) DESC")
       List<Object[]> getFieldStats(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

       @Query(value = "SELECT * FROM reservations WHERE status <> 'CANCELLED' ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
       Optional<Reservation> findLatestReservation();

       @Query("SELECT FUNCTION('DATE', r.startTime), COALESCE(SUM(r.totalPrice), 0) " +
                     "FROM Reservation r WHERE r.startTime >= :from AND r.startTime < :to " +
                     "AND r.status <> 'CANCELLED' GROUP BY FUNCTION('DATE', r.startTime) " +
                     "ORDER BY FUNCTION('DATE', r.startTime) ASC")
       List<Object[]> getDailyRevenueBreakdown(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

       @Query("SELECT r.paymentMethod, COUNT(r), COALESCE(SUM(r.totalPrice), 0) " +
                     "FROM Reservation r WHERE r.startTime >= :from AND r.startTime < :to " +
                     "AND r.status <> 'CANCELLED' AND r.paymentMethod IS NOT NULL " +
                     "GROUP BY r.paymentMethod ORDER BY COUNT(r) DESC")
       List<Object[]> getPaymentMethodDistribution(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

       @Query(value = "SELECT EXTRACT(YEAR FROM start_time) AS yr, EXTRACT(MONTH FROM start_time) AS mo, COALESCE(SUM(total_price), 0) "
                     +
                     "FROM reservations WHERE start_time >= :from AND start_time < :to " +
                     "AND status <> 'CANCELLED' " +
                     "GROUP BY yr, mo ORDER BY yr ASC, mo ASC", nativeQuery = true)
       List<Object[]> getMonthlyRevenueTrend(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

       @Query(value = "SELECT EXTRACT(DOW FROM start_time) AS dow, EXTRACT(HOUR FROM start_time) AS hr, COUNT(*) " +
                     "FROM reservations WHERE start_time >= :from AND start_time < :to " +
                     "AND status <> 'CANCELLED' " +
                     "GROUP BY dow, hr ORDER BY dow, hr", nativeQuery = true)
       List<Object[]> getHourlyUtilization(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

       @Query("SELECT COALESCE(SUM(r.durationMinutes), 0) FROM Reservation r " +
                     "WHERE r.startTime >= :from AND r.startTime < :to " +
                     "AND r.status <> 'CANCELLED'")
       long sumBookedMinutes(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

       @Query(value = "SELECT EXTRACT(HOUR FROM start_time) AS hr, COUNT(*) AS cnt " +
                     "FROM reservations WHERE start_time >= :from AND start_time < :to " +
                     "AND status <> 'CANCELLED' GROUP BY hr ORDER BY cnt DESC", nativeQuery = true)
       List<Object[]> getHourlyBookingDistribution(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

       @Query("SELECT COUNT(r) FROM Reservation r WHERE r.startTime >= :from AND r.startTime < :to " +
                     "AND r.status = 'CANCELLED'")
       long countCancelledByDateRange(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

       @Query("SELECT r.field.id, r.field.name, COALESCE(SUM(r.durationMinutes), 0) " +
                     "FROM Reservation r WHERE r.startTime >= :from AND r.startTime < :to " +
                     "AND r.status <> 'CANCELLED' GROUP BY r.field.id, r.field.name")
       List<Object[]> getFieldBookedMinutes(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

       @Query(value = "SELECT CAST(start_time AS DATE) AS d, COUNT(*) " +
                     "FROM reservations WHERE start_time >= :from AND start_time < :to " +
                     "AND status <> 'CANCELLED' GROUP BY d ORDER BY d ASC", nativeQuery = true)
       List<Object[]> getDailyBookingCounts(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);

       @Query("SELECT COUNT(r) FROM Reservation r WHERE r.startTime >= :from AND r.startTime < :to")
       long countAllByDateRange(@Param("from") ZonedDateTime from, @Param("to") ZonedDateTime to);
}
