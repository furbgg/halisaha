package com.halisaha.auth;

import com.halisaha.auth.dto.AuthResponse;
import com.halisaha.auth.dto.LoginRequest;
import com.halisaha.auth.dto.RegisterRequest;
import com.halisaha.auth.dto.TotpSetupResponse;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.common.exception.UnauthorizedException;
import com.halisaha.config.CryptoUtil;
import com.halisaha.user.UserRole;
import com.halisaha.user.entity.User;
import com.halisaha.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final LoginRateLimiter rateLimiter;
    private final TotpService totpService;
    private final CryptoUtil cryptoUtil;
    private final SessionService sessionService;


    @Transactional
    public AuthResponse login(LoginRequest request, String clientIp, String userAgent) {
        String rateLimitKey = "login:" + clientIp;
        rateLimiter.checkRateLimit(rateLimitKey);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> {
                    rateLimiter.recordAttempt(rateLimitKey);
                    log.warn("Login attempt with unknown email from IP: {}", clientIp);
                    return new BadCredentialsException("Ungültige Anmeldedaten");
                });

        if (!user.getActive()) {
            rateLimiter.recordAttempt(rateLimitKey);
            throw new BadCredentialsException("Ungültige Anmeldedaten");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            rateLimiter.recordAttempt(rateLimitKey);
            log.warn("Failed login attempt from IP: {}", clientIp);
            throw new BadCredentialsException("Ungültige Anmeldedaten");
        }

        if (user.getRole() == UserRole.ADMIN && user.getTotpSecret() != null) {
            if (request.getTotpCode() == null || request.getTotpCode().isBlank()) {
                return AuthResponse.builder()
                        .totpRequired(true)
                        .build();
            }
            int code;
            try {
                code = Integer.parseInt(request.getTotpCode().trim());
            } catch (NumberFormatException e) {
                rateLimiter.recordAttempt(rateLimitKey);
                throw new BadCredentialsException("Ungültiger 2FA-Code");
            }
            String decryptedSecret = cryptoUtil.decrypt(user.getTotpSecret());
            if (!totpService.verifyCode(decryptedSecret, code)) {
                rateLimiter.recordAttempt(rateLimitKey);
                log.warn("Failed TOTP verification for admin user ID: {}", user.getId());
                throw new BadCredentialsException("Ungültiger 2FA-Code");
            }
        }

        rateLimiter.resetAttempts(rateLimitKey);
        log.info("Successful login for user ID: {}", user.getId());

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        sessionService.createSession(user.getId(), refreshToken, userAgent, clientIp);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .displayId(user.getDisplayId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .totpRequired(false)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, String clientIp, String userAgent) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new IllegalArgumentException("Diese E-Mail-Adresse ist bereits registriert.");
        }

        String displayId = generateDisplayId();

        User user = User.builder()
                .displayId(displayId)
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .active(true)
                .build();

        user = userRepository.save(user);
        log.info("New user registered with ID: {}", user.getId());

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());
        sessionService.createSession(user.getId(), refreshToken, userAgent, clientIp);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .displayId(user.getDisplayId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .totpRequired(false)
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken, String clientIp) {
        String rateLimitKey = "refresh:" + clientIp;
        rateLimiter.checkRateLimit(rateLimitKey);

        if (!jwtUtil.validateToken(refreshToken)) {
            rateLimiter.recordAttempt(rateLimitKey);
            throw new UnauthorizedException("Ungültiger Refresh-Token");
        }
        if (!jwtUtil.isRefreshToken(refreshToken)) {
            rateLimiter.recordAttempt(rateLimitKey);
            throw new UnauthorizedException("Ungültiger Token-Typ");
        }

        Long userId = jwtUtil.extractUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Benutzer nicht gefunden"));

        if (!user.getActive()) {
            rateLimiter.recordAttempt(rateLimitKey);
            throw new UnauthorizedException("Benutzerkonto ist deaktiviert");
        }

        if (sessionService.isTokenRevoked(refreshToken)) {
            rateLimiter.recordAttempt(rateLimitKey);
            throw new UnauthorizedException("Sitzung wurde beendet. Bitte erneut anmelden.");
        }

        rateLimiter.resetAttempts(rateLimitKey);

        sessionService.rotateToken(refreshToken, user.getId());

        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getId());

        sessionService.createSessionFromRefresh(user.getId(), newRefreshToken, refreshToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .displayId(user.getDisplayId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .totpRequired(false)
                .build();
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        sessionService.revokeByRefreshToken(refreshToken);
    }

    @Transactional
    public TotpSetupResponse setupTotp(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Benutzer nicht gefunden"));

        if (user.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("2FA ist nur für Administratoren verfügbar");
        }

        String secret = totpService.generateSecret();
        String qrCodeUri = totpService.generateQrCodeUri(secret, user.getEmail());

        user.setPendingTotpSecret(cryptoUtil.encrypt(secret));
        userRepository.save(user);

        return TotpSetupResponse.builder()
                .secret(secret)
                .qrCodeUri(qrCodeUri)
                .build();
    }

    @Transactional
    public boolean verifyAndEnableTotp(Long userId, int code) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Benutzer nicht gefunden"));

        String pendingSecret = user.getPendingTotpSecret() != null
                ? cryptoUtil.decrypt(user.getPendingTotpSecret()) : null;

        String secretToVerify;
        if (pendingSecret != null) {
            secretToVerify = pendingSecret;
        } else if (user.getTotpSecret() != null) {
            secretToVerify = cryptoUtil.decrypt(user.getTotpSecret());
        } else {
            throw new IllegalArgumentException("2FA wurde noch nicht eingerichtet");
        }

        if (!totpService.verifyCode(secretToVerify, code)) {
            return false;
        }

        if (pendingSecret != null) {
            user.setTotpSecret(cryptoUtil.encrypt(pendingSecret));
            user.setPendingTotpSecret(null);
            userRepository.save(user);
            log.info("2FA enabled for admin user ID: {}", userId);
        }

        return true;
    }

    @Transactional
    public void disableTotp(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Benutzer nicht gefunden"));

        user.setTotpSecret(null);
        userRepository.save(user);
        log.info("2FA disabled for user ID: {}", userId);
    }

    @Transactional(readOnly = true)
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase().trim()).orElse(null);
    }

    public String generateNewDisplayId() {
        return generateDisplayId();
    }

    private String generateDisplayId() {
        String year = String.valueOf(Year.now().getValue());
        String id;
        do {
            int number = ThreadLocalRandom.current().nextInt(1, 10000);
            id = String.format("HS-%s-%03d", year, number);
        } while (userRepository.findByDisplayId(id).isPresent());
        return id;
    }
}
