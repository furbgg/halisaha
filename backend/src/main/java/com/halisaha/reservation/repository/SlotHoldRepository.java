package com.halisaha.reservation.repository;

import com.halisaha.reservation.entity.SlotHold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.List;

public interface SlotHoldRepository extends JpaRepository<SlotHold, Long> {

       @Query(value = "SELECT * FROM slot_holds h WHERE h.field_id = :fieldId " +
                     "AND h.start_time < :endTime " +
                     "AND (h.start_time + make_interval(mins => h.duration_minutes)) > :startTime " +
                     "AND h.expires_at > :now", nativeQuery = true)
       List<SlotHold> findActiveHoldsInRange(@Param("fieldId") Long fieldId,
                     @Param("startTime") ZonedDateTime startTime,
                     @Param("endTime") ZonedDateTime endTime,
                     @Param("now") ZonedDateTime now);

       @Query("SELECT h FROM SlotHold h WHERE h.field.id = :fieldId " +
                     "AND h.startTime >= :dayStart AND h.startTime < :dayEnd " +
                     "AND h.expiresAt > :now")
       List<SlotHold> findActiveHoldsByFieldAndDate(@Param("fieldId") Long fieldId,
                     @Param("dayStart") ZonedDateTime dayStart,
                     @Param("dayEnd") ZonedDateTime dayEnd,
                     @Param("now") ZonedDateTime now);

       List<SlotHold> findBySessionId(String sessionId);

       @Modifying
       @Query("DELETE FROM SlotHold h WHERE h.expiresAt <= :now")
       int deleteExpiredHolds(@Param("now") ZonedDateTime now);

       @Modifying
       @Query("DELETE FROM SlotHold h WHERE h.sessionId = :sessionId")
       int deleteBySessionId(@Param("sessionId") String sessionId);
}
