package com.halisaha.reservation;

import com.halisaha.common.AppConstants;

import com.halisaha.common.exception.SlotAlreadyBookedException;
import com.halisaha.common.service.AppSettingsService;
import com.halisaha.field.entity.Field;
import com.halisaha.field.repository.FieldRepository;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.entity.SlotHold;
import com.halisaha.reservation.repository.ReservationRepository;
import com.halisaha.reservation.repository.SlotHoldRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SlotHoldService {

    private final SlotHoldRepository slotHoldRepository;
    private final ReservationRepository reservationRepository;
    private final FieldRepository fieldRepository;
    private final AppSettingsService appSettingsService;

    @Transactional
    public SlotHold createHold(Long fieldId, ZonedDateTime startTime, int durationMinutes, String sessionId) {
        Field field = fieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("Platz nicht gefunden"));

        ZonedDateTime endTime = startTime.plusMinutes(durationMinutes);
        List<Reservation> conflicts = reservationRepository.findConflictingReservations(fieldId, startTime, endTime);
        if (!conflicts.isEmpty()) {
            throw new SlotAlreadyBookedException("Dieser Zeitraum ist bereits gebucht.");
        }

        ZonedDateTime now = ZonedDateTime.now(AppConstants.VIENNA);
        List<SlotHold> existingHolds = slotHoldRepository.findActiveHoldsInRange(fieldId, startTime, endTime, now);
        for (SlotHold existing : existingHolds) {
            if (!existing.getSessionId().equals(sessionId)) {
                throw new SlotAlreadyBookedException("Dieser Zeitraum wird gerade von jemandem reserviert.");
            }
        }

        int holdMinutes = appSettingsService.getInt("hold_duration_minutes", 5);

        SlotHold hold = SlotHold.builder()
                .field(field)
                .startTime(startTime)
                .durationMinutes(durationMinutes)
                .sessionId(sessionId)
                .expiresAt(now.plusMinutes(holdMinutes))
                .build();

        return slotHoldRepository.save(hold);
    }

    @Transactional
    public void releaseHold(String sessionId) {
        slotHoldRepository.deleteBySessionId(sessionId);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredHolds() {
        int deleted = slotHoldRepository.deleteExpiredHolds(ZonedDateTime.now(AppConstants.VIENNA));
        if (deleted > 0) {
            log.debug("Cleaned up {} expired slot holds", deleted);
        }
    }
}
