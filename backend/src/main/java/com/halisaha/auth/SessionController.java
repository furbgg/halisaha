package com.halisaha.auth;

import com.halisaha.auth.dto.ChangePasswordRequest;
import com.halisaha.auth.dto.SessionResponse;
import com.halisaha.auth.entity.ActiveSession;
import com.halisaha.common.AppConstants;
import com.halisaha.common.dto.ApiResponse;
import com.halisaha.user.entity.User;
import com.halisaha.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    /**
     * List all active sessions for current admin user.
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getActiveSessions(
            Authentication authentication,
            HttpServletRequest request) {

        Long userId = (Long) authentication.getPrincipal();

        List<ActiveSession> sessions = sessionService.getActiveSessions(userId);
        String clientIp = getClientIp(request);

        List<SessionResponse> response = sessions.stream()
                .map(s -> SessionResponse.builder()
                        .id(s.getId())
                        .deviceInfo(s.getDeviceInfo())
                        .ipAddress(s.getIpAddress())
                        .createdAt(s.getCreatedAt() != null
                                ? s.getCreatedAt().withZoneSameInstant(AppConstants.VIENNA).format(FMT)
                                : "—")
                        .lastUsedAt(s.getLastUsedAt() != null
                                ? s.getLastUsedAt().withZoneSameInstant(AppConstants.VIENNA).format(FMT)
                                : "—")
                        .current(s.getIpAddress() != null && s.getIpAddress().equals(clientIp)
                                && sessions.indexOf(s) == 0)
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Revoke a single session by ID.
     */
    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> revokeSession(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = (Long) authentication.getPrincipal();
        boolean revoked = sessionService.revokeSession(id, userId);

        if (!revoked) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Sitzung konnte nicht beendet werden."));
        }

        return ResponseEntity.ok(ApiResponse.success("Sitzung beendet.", null));
    }

    /**
     * Revoke all other sessions (keep current).
     */
    @DeleteMapping("/sessions/others")
    public ResponseEntity<ApiResponse<Void>> revokeAllOtherSessions(
            Authentication authentication,
            HttpServletRequest request) {

        Long userId = (Long) authentication.getPrincipal();

        String refreshToken = request.getHeader("X-Refresh-Token");
        if (refreshToken == null || refreshToken.isBlank()) {
            sessionService.revokeAllOtherSessions(userId, "no-match");
        } else {
            sessionService.revokeAllOtherSessions(userId, refreshToken);
        }

        return ResponseEntity.ok(ApiResponse.success("Alle anderen Sitzungen beendet.", null));
    }

    /**
     * Change admin password.
     */
    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("Benutzer nicht gefunden."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Aktuelles Passwort ist falsch."));
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Passwort erfolgreich geändert.", null));
    }

    /**
     * Check 2FA status for current admin.
     */
    @GetMapping("/2fa/status")
    public ResponseEntity<ApiResponse<java.util.Map<String, Boolean>>> get2faStatus(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("Benutzer nicht gefunden."));
        boolean enabled = user.getTotpSecret() != null;
        return ResponseEntity.ok(ApiResponse.success(java.util.Map.of("enabled", enabled)));
    }

    private String getClientIp(HttpServletRequest request) {
        return request.getRemoteAddr();
    }
}
