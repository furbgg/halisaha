package com.halisaha.auth.repository;

import com.halisaha.auth.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {

    Optional<LoginAttempt> findByRateKey(String rateKey);

    void deleteByRateKey(String rateKey);

    @Modifying
    @Query("DELETE FROM LoginAttempt la WHERE la.windowStartMillis < :cutoff")
    void deleteExpiredBefore(@Param("cutoff") long cutoffMillis);

    List<LoginAttempt> findByWindowStartMillisGreaterThan(long cutoffMillis);
}
