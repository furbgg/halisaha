package com.halisaha.reservation;

import com.halisaha.auth.LoginRateLimiter;
import com.halisaha.common.dto.ApiResponse;
import com.halisaha.equipment.EquipmentService;
import com.halisaha.equipment.dto.SizeAvailabilityResponse;
import com.halisaha.equipment.entity.Equipment;
import com.halisaha.reservation.dto.CreateReservationRequest;
import com.halisaha.reservation.dto.ModifyReservationRequest;
import com.halisaha.reservation.dto.ReservationResponse;
import com.halisaha.reservation.dto.SlotHoldRequest;
import com.halisaha.reservation.entity.SlotHold;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.ZonedDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final SlotHoldService slotHoldService;
    private final EquipmentService equipmentService;
    private final LoginRateLimiter rateLimiter;

    @PostMapping("/reservations")
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            @Valid @RequestBody CreateReservationRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        rateLimiter.checkRateLimit("reservation:" + httpRequest.getRemoteAddr());
        Long userId = getUserId(authentication);
        ReservationResponse response = reservationService.createReservation(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reservierung erfolgreich erstellt", response));
    }

    @GetMapping("/reservations/{confirmationCode}")
    public ResponseEntity<ApiResponse<ReservationResponse>> getReservation(
            @PathVariable String confirmationCode,
            Authentication authentication,
            @RequestHeader(value = "X-Manage-Token", required = false) String manageToken) {
        Long userId = getUserId(authentication);
        ReservationResponse response = reservationService.getByConfirmationCodePublic(
                confirmationCode, userId, manageToken);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/reservations/{confirmationCode}")
    public ResponseEntity<ApiResponse<ReservationResponse>> modifyReservation(
            @PathVariable String confirmationCode,
            @Valid @RequestBody ModifyReservationRequest request,
            Authentication authentication,
            @RequestHeader(value = "X-Manage-Token", required = false) String manageToken) {

        Long userId = getUserId(authentication);
        boolean isAdmin = isAdmin(authentication);
        ReservationResponse response = reservationService.modifyReservation(
                confirmationCode, request.getStartTime(), request.getDurationMinutes(),
                userId, manageToken, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Reservierung geaendert", response));
    }

    @DeleteMapping("/reservations/{confirmationCode}")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(
            @PathVariable String confirmationCode,
            Authentication authentication,
            @RequestHeader(value = "X-Manage-Token", required = false) String manageToken) {

        Long userId = getUserId(authentication);
        boolean isAdmin = isAdmin(authentication);
        ReservationResponse response = reservationService.cancelReservation(
                confirmationCode, userId, manageToken, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Reservierung storniert", response));
    }

    private Long getUserId(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        return principal instanceof Long ? (Long) principal : null;
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    @PostMapping("/reservations/hold")
    public ResponseEntity<ApiResponse<SlotHold>> createHold(
            @Valid @RequestBody SlotHoldRequest request,
            HttpServletRequest httpRequest) {
        rateLimiter.checkRateLimit("hold:" + httpRequest.getRemoteAddr());
        SlotHold hold = slotHoldService.createHold(
                request.getFieldId(), request.getStartTime(),
                request.getDurationMinutes(), request.getSessionId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Zeitraum voruebergehend reserviert", hold));
    }

    @DeleteMapping("/reservations/hold/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> releaseHold(@PathVariable String sessionId) {
        slotHoldService.releaseHold(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Reservierung freigegeben", null));
    }

    @GetMapping("/equipment/rentable")
    public ResponseEntity<ApiResponse<List<Equipment>>> getRentableEquipment() {
        List<Equipment> equipment = equipmentService.getRentableEquipment();
        return ResponseEntity.ok(ApiResponse.success(equipment));
    }

    @GetMapping("/equipment/{id}/availability")
    public ResponseEntity<ApiResponse<List<SizeAvailabilityResponse>>> getEquipmentAvailability(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime end) {

        List<SizeAvailabilityResponse> availability = equipmentService.getSizeAvailability(id, start, end);
        return ResponseEntity.ok(ApiResponse.success(availability));
    }
}
