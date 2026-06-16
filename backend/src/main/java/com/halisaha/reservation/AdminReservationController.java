package com.halisaha.reservation;

import com.halisaha.common.dto.ApiResponse;
import com.halisaha.common.service.AuditLogService;
import com.halisaha.reservation.dto.ModifyReservationRequest;
import com.halisaha.reservation.dto.ReservationResponse;
import com.halisaha.reservation.dto.ReservationStatsResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/admin/reservations")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminReservationController {

    private final ReservationService reservationService;
    private final AuditLogService auditLogService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ReservationStatsResponse>> getStats() {
        ReservationStatsResponse stats = reservationService.getReservationStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getAllReservations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        if (from == null)
            from = LocalDate.now().minusDays(30);
        if (to == null)
            to = LocalDate.now().plusDays(30);

        List<ReservationResponse> reservations = reservationService.getReservationsByDateRange(from, to);
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getTodayReservations() {
        List<ReservationResponse> reservations = reservationService.getTodayReservations();
        return ResponseEntity.ok(ApiResponse.success(reservations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResponse>> getReservation(@PathVariable Long id) {
        ReservationResponse response = reservationService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResponse>> modifyReservation(
            @PathVariable Long id,
            @Valid @RequestBody ModifyReservationRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        Long adminId = (Long) authentication.getPrincipal();
        ReservationResponse before = reservationService.getById(id);

        ReservationResponse response = reservationService.adminModifyReservation(
                id, request.getStartTime(), request.getDurationMinutes());

        auditLogService.logAction(adminId, "MODIFY", "RESERVATION", id,
                before, response, getClientIp(httpRequest));

        return ResponseEntity.ok(ApiResponse.success("Reservierung geändert", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        Long adminId = (Long) authentication.getPrincipal();
        ReservationResponse before = reservationService.getById(id);

        ReservationResponse response = reservationService.adminCancelReservation(id);

        auditLogService.logAction(adminId, "CANCEL", "RESERVATION", id,
                before, response, getClientIp(httpRequest));

        return ResponseEntity.ok(ApiResponse.success("Reservierung storniert", response));
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            String[] ips = xff.split(",");
            return ips[ips.length - 1].trim();
        }
        return request.getRemoteAddr();
    }
}
