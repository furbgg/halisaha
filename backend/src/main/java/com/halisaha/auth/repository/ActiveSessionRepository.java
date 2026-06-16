package com.halisaha.auth.repository;

import com.halisaha.auth.entity.ActiveSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

public interface ActiveSessionRepository extends JpaRepository<ActiveSession, Long> {

    List<ActiveSession> findByUserIdAndRevokedFalseOrderByLastUsedAtDesc(Long userId);

    Optional<ActiveSession> findByTokenHashAndRevokedFalse(String tokenHash);

    Optional<ActiveSession> findByTokenHash(String tokenHash);

    @Modifying
    @Query("UPDATE ActiveSession s SET s.revoked = true WHERE s.userId = :userId AND s.tokenHash <> :currentHash AND s.revoked = false")
    int revokeAllOtherSessions(@Param("userId") Long userId, @Param("currentHash") String currentHash);

    @Modifying
    @Query("UPDATE ActiveSession s SET s.revoked = true WHERE s.userId = :userId AND s.revoked = false")
    int revokeAllByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM ActiveSession s WHERE s.revoked = true AND s.lastUsedAt < :cutoff")
    int deleteRevokedBefore(@Param("cutoff") ZonedDateTime cutoff);
}
