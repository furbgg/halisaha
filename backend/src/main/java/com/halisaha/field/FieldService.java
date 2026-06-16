package com.halisaha.field;

import com.halisaha.common.AppConstants;

import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.field.dto.FieldAvailabilityResponse;
import com.halisaha.field.dto.TimeSlot;
import com.halisaha.field.entity.Field;
import com.halisaha.field.repository.FieldRepository;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.entity.SlotHold;
import com.halisaha.reservation.repository.ReservationRepository;
import com.halisaha.reservation.repository.SlotHoldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FieldService {

    private final FieldRepository fieldRepository;
    private final ReservationRepository reservationRepository;
    private final SlotHoldRepository slotHoldRepository;

    @Transactional(readOnly = true)
    public List<Field> getAllActiveFields() {
        return fieldRepository.findByActiveTrueOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public Field getFieldById(Long id) {
        return fieldRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Platz nicht gefunden"));
    }

    @Transactional(readOnly = true)
    public FieldAvailabilityResponse getAvailability(Long fieldId, LocalDate date, int durationMinutes) {
        Field field = getFieldById(fieldId);

        boolean durationAllowed = false;
        for (Integer d : field.getAllowedDurations()) {
            if (d == durationMinutes) {
                durationAllowed = true;
                break;
            }
        }
        if (!durationAllowed) {
            throw new IllegalArgumentException(
                    "Dauer von " + durationMinutes + " Minuten ist für diesen Platz nicht erlaubt");
        }

        LocalTime opening = field.getOpeningTimeForDate(date);
        LocalTime closing = field.getClosingTimeForDate(date);

        int openingMinutes = opening.getHour() * 60 + opening.getMinute();
        int closingMinutes = closing.getHour() * 60 + closing.getMinute();
        if (closingMinutes <= openingMinutes) {
            closingMinutes += 24 * 60;
        }

        ZonedDateTime dayStart = date.atStartOfDay(AppConstants.VIENNA);
        ZonedDateTime dayEnd = date.plusDays(2).atStartOfDay(AppConstants.VIENNA);

        List<Reservation> reservations = reservationRepository.findActiveByFieldAndDate(fieldId, dayStart, dayEnd);

        List<SlotHold> holds = slotHoldRepository.findActiveHoldsByFieldAndDate(
                fieldId, dayStart, dayEnd, ZonedDateTime.now(AppConstants.VIENNA));

        List<TimeSlot> slots = new ArrayList<>();

        for (int m = openingMinutes; m + durationMinutes <= closingMinutes; m += 30) {
            int slotHour = (m / 60) % 24;
            int slotMinute = m % 60;
            LocalDate slotDate = (m >= 24 * 60) ? date.plusDays(1) : date;
            LocalTime slotTime = LocalTime.of(slotHour, slotMinute);

            ZonedDateTime slotStart = slotDate.atTime(slotTime).atZone(AppConstants.VIENNA);
            ZonedDateTime slotEnd = slotStart.plusMinutes(durationMinutes);

            boolean isBooked = isSlotOverlapping(slotStart, slotEnd, reservations);

            boolean isHeld = false;
            for (SlotHold hold : holds) {
                ZonedDateTime holdEnd = hold.getStartTime().plusMinutes(hold.getDurationMinutes());
                if (slotStart.isBefore(holdEnd) && slotEnd.isAfter(hold.getStartTime())) {
                    isHeld = true;
                    break;
                }
            }

            boolean isPast = slotStart.isBefore(ZonedDateTime.now(AppConstants.VIENNA));

            slots.add(TimeSlot.builder()
                    .startTime(slotStart)
                    .endTime(slotEnd)
                    .available(!isBooked && !isHeld && !isPast)
                    .held(isHeld)
                    .build());
        }

        return FieldAvailabilityResponse.builder()
                .fieldId(field.getId())
                .fieldName(field.getName())
                .date(date)
                .durationMinutes(durationMinutes)
                .slots(slots)
                .build();
    }

    private boolean isSlotOverlapping(ZonedDateTime slotStart, ZonedDateTime slotEnd,
            List<Reservation> reservations) {
        for (Reservation r : reservations) {
            if (slotStart.isBefore(r.getEndTime()) && slotEnd.isAfter(r.getStartTime())) {
                return true;
            }
        }
        return false;
    }

    @Transactional
    public Field createField(Field field) {
        return fieldRepository.save(field);
    }

    @Transactional
    public Field updateField(Long id, Field updated) {
        Field field = getFieldById(id);
        field.setName(updated.getName());
        field.setSupportedSports(updated.getSupportedSports());
        field.setHourlyPrice(updated.getHourlyPrice());
        field.setAllowedDurations(updated.getAllowedDurations());
        field.setActive(updated.getActive());
        field.setOpeningTime(updated.getOpeningTime());
        field.setClosingTime(updated.getClosingTime());
        field.setWeekdayOpening(updated.getWeekdayOpening());
        field.setWeekdayClosing(updated.getWeekdayClosing());
        field.setWeekendOpening(updated.getWeekendOpening());
        field.setWeekendClosing(updated.getWeekendClosing());
        return fieldRepository.save(field);
    }

    @Transactional
    public void deleteField(Long id) {
        Field field = getFieldById(id);
        field.setActive(false);
        fieldRepository.save(field);
    }
}
