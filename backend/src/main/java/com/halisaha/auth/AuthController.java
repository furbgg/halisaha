package com.halisaha.auth;

import com.halisaha.auth.dto.AuthResponse;
import com.halisaha.auth.dto.ForgotPasswordRequest;
import com.halisaha.auth.dto.LoginRequest;
import com.halisaha.auth.dto.RefreshTokenRequest;
import com.halisaha.auth.dto.RegisterRequest;
import com.halisaha.auth.dto.ResetPasswordRequest;
import com.halisaha.auth.dto.TotpSetupResponse;
import com.halisaha.auth.dto.TotpVerifyRequest;
import com.halisaha.common.dto.ApiResponse;
import com.halisaha.notification.EmailService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "refresh_token";

    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;

    @Value("${jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpirationMs;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String clientIp = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        AuthResponse response = authService.login(request, clientIp, userAgent);

        if (response.isTotpRequired()) {
            return ResponseEntity.ok(ApiResponse.success("2FA-Code erforderlich", response));
        }

        attachRefreshTokenCookie(httpResponse, response.getRefreshToken());
        response.setRefreshToken(null);
        return ResponseEntity.ok(ApiResponse.success("Erfolgreich angemeldet", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String clientIp = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        AuthResponse response = authService.register(request, clientIp, userAgent);
        attachRefreshTokenCookie(httpResponse, response.getRefreshToken());
        response.setRefreshToken(null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Erfolgreich registriert", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String clientIp = getClientIp(httpRequest);
        String refreshToken = extractRefreshTokenFromCookie(httpRequest);
        if (refreshToken == null && request != null) {
            refreshToken = request.getRefreshToken();
        }
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Refresh-Token fehlt."));
        }

        AuthResponse response = authService.refreshToken(refreshToken, clientIp);
        attachRefreshTokenCookie(httpResponse, response.getRefreshToken());
        response.setRefreshToken(null);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        String refreshToken = extractRefreshTokenFromCookie(httpRequest);
        authService.logout(refreshToken);
        clearRefreshTokenCookie(httpResponse);
        return ResponseEntity.ok(ApiResponse.success("Erfolgreich abgemeldet", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        String token = passwordResetService.createResetToken(request.getEmail());

        if (token != null) {
            var user = authService.findUserByEmail(request.getEmail());
            if (user != null) {
                emailService.sendPasswordReset(user.getEmail(), user.getName(), token);
            }
        }

        return ResponseEntity.ok(ApiResponse.success(
                "Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zuruecksetzen gesendet.", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Passwort erfolgreich zurueckgesetzt.", null));
    }

    @GetMapping("/2fa/setup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TotpSetupResponse>> setup2fa(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        TotpSetupResponse response = authService.setupTotp(userId);
        return ResponseEntity.ok(ApiResponse.success("QR-Code fuer Google Authenticator", response));
    }

    @PostMapping("/2fa/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> verify2fa(
            @Valid @RequestBody TotpVerifyRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        boolean valid = authService.verifyAndEnableTotp(userId, request.getCode());
        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Ungueltiger 2FA-Code. Bitte versuchen Sie es erneut."));
        }
        return ResponseEntity.ok(ApiResponse.success("2FA erfolgreich aktiviert", null));
    }

    @DeleteMapping("/2fa")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> disable2fa(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        authService.disableTotp(userId);
        return ResponseEntity.ok(ApiResponse.success("2FA deaktiviert", null));
    }

    private void attachRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        long maxAgeSeconds = Math.max(1L, refreshTokenExpirationMs / 1000L);
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(isProdProfile())
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(maxAgeSeconds)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(isProdProfile())
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (REFRESH_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private boolean isProdProfile() {
        if (activeProfile == null || activeProfile.isBlank()) {
            return false;
        }
        for (String profile : activeProfile.split(",")) {
            if ("prod".equalsIgnoreCase(profile.trim())) {
                return true;
            }
        }
        return false;
    }

    private String getClientIp(HttpServletRequest request) {
        return request.getRemoteAddr();
    }
}
