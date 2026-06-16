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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService — Login, Register, Refresh & 2FA")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private LoginRateLimiter rateLimiter;
    @Mock
    private TotpService totpService;
    @Mock
    private CryptoUtil cryptoUtil;
    @Mock
    private SessionService sessionService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private User adminUser;
    private static final String CLIENT_IP = "192.168.1.100";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .displayId("HS-2026-001")
                .name("Max Mustermann")
                .email("max@example.com")
                .passwordHash("$2a$10$hashedpassword")
                .role(UserRole.USER)
                .active(true)
                .build();

        adminUser = User.builder()
                .id(2L)
                .displayId("HS-2026-002")
                .name("Admin User")
                .email("admin@halisaha.at")
                .passwordHash("$2a$10$adminhashedpassword")
                .role(UserRole.ADMIN)
                .totpSecret("JBSWY3DPEHPK3PXP")
                .active(true)
                .build();
    }


    @Nested
    @DisplayName("Login")
    class LoginTests {

        @Test
        @DisplayName("Erfolgreicher Login gibt Tokens und Benutzerdaten zurueck")
        void successfulLogin_returnsTokensAndUserData() {
            LoginRequest request = new LoginRequest("max@example.com", "password123", null);

            when(userRepository.findByEmail("max@example.com")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("password123", testUser.getPasswordHash())).thenReturn(true);
            when(jwtUtil.generateAccessToken(1L, "max@example.com", "USER")).thenReturn("access-token");
            when(jwtUtil.generateRefreshToken(1L)).thenReturn("refresh-token");

            AuthResponse response = authService.login(request, CLIENT_IP, "TestAgent");

            assertThat(response.getAccessToken()).isEqualTo("access-token");
            assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
            assertThat(response.getDisplayId()).isEqualTo("HS-2026-001");
            assertThat(response.getName()).isEqualTo("Max Mustermann");
            assertThat(response.getEmail()).isEqualTo("max@example.com");
            assertThat(response.getRole()).isEqualTo(UserRole.USER);
            assertThat(response.isTotpRequired()).isFalse();

            verify(rateLimiter).checkRateLimit("login:" + CLIENT_IP);
            verify(rateLimiter).resetAttempts("login:" + CLIENT_IP);
        }

        @Test
        @DisplayName("Login mit E-Mail-Trimming und Lowercase")
        void login_trimsAndLowercasesEmail() {
            LoginRequest request = new LoginRequest("  Max@Example.COM  ", "password123", null);

            when(userRepository.findByEmail("max@example.com")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("password123", testUser.getPasswordHash())).thenReturn(true);
            when(jwtUtil.generateAccessToken(anyLong(), anyString(), anyString())).thenReturn("token");
            when(jwtUtil.generateRefreshToken(anyLong())).thenReturn("refresh");

            authService.login(request, CLIENT_IP, "TestAgent");

            verify(userRepository).findByEmail("max@example.com");
        }

        @Test
        @DisplayName("Login mit falscher E-Mail wirft BadCredentialsException")
        void login_unknownEmail_throwsBadCredentials() {
            LoginRequest request = new LoginRequest("unknown@example.com", "password", null);

            when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request, CLIENT_IP, "TestAgent"))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Ungültige Anmeldedaten");

            verify(rateLimiter).recordAttempt("login:" + CLIENT_IP);
        }

        @Test
        @DisplayName("Login mit falschem Passwort wirft BadCredentialsException")
        void login_wrongPassword_throwsBadCredentials() {
            LoginRequest request = new LoginRequest("max@example.com", "wrongpassword", null);

            when(userRepository.findByEmail("max@example.com")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("wrongpassword", testUser.getPasswordHash())).thenReturn(false);

            assertThatThrownBy(() -> authService.login(request, CLIENT_IP, "TestAgent"))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Ungültige Anmeldedaten");

            verify(rateLimiter).recordAttempt("login:" + CLIENT_IP);
        }

        @Test
        @DisplayName("Login mit deaktiviertem Konto wirft BadCredentialsException")
        void login_inactiveUser_throwsBadCredentials() {
            testUser.setActive(false);
            LoginRequest request = new LoginRequest("max@example.com", "password123", null);

            when(userRepository.findByEmail("max@example.com")).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> authService.login(request, CLIENT_IP, "TestAgent"))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Ungültige Anmeldedaten");

            verify(rateLimiter).recordAttempt("login:" + CLIENT_IP);
        }

        @Test
        @DisplayName("Rate-Limit Pruefung wird vor Login aufgerufen")
        void login_checksRateLimitFirst() {
            doThrow(new com.halisaha.common.exception.RateLimitExceededException("Zu viele Versuche"))
                    .when(rateLimiter).checkRateLimit("login:" + CLIENT_IP);

            LoginRequest request = new LoginRequest("max@example.com", "password", null);

            assertThatThrownBy(() -> authService.login(request, CLIENT_IP, "TestAgent"))
                    .isInstanceOf(com.halisaha.common.exception.RateLimitExceededException.class);

            verify(userRepository, never()).findByEmail(anyString());
        }
    }


    @Nested
    @DisplayName("Login mit 2FA (TOTP)")
    class LoginWith2FATests {

        @Test
        @DisplayName("Admin mit TOTP ohne Code gibt totpRequired=true zurueck")
        void adminLogin_noTotpCode_returnsTotpRequired() {
            LoginRequest request = new LoginRequest("admin@halisaha.at", "adminpass", null);

            when(userRepository.findByEmail("admin@halisaha.at")).thenReturn(Optional.of(adminUser));
            when(passwordEncoder.matches("adminpass", adminUser.getPasswordHash())).thenReturn(true);

            AuthResponse response = authService.login(request, CLIENT_IP, "TestAgent");

            assertThat(response.isTotpRequired()).isTrue();
            assertThat(response.getAccessToken()).isNull();
            assertThat(response.getRefreshToken()).isNull();
        }

        @Test
        @DisplayName("Admin mit TOTP und leerem Code gibt totpRequired=true zurueck")
        void adminLogin_blankTotpCode_returnsTotpRequired() {
            LoginRequest request = new LoginRequest("admin@halisaha.at", "adminpass", "  ");

            when(userRepository.findByEmail("admin@halisaha.at")).thenReturn(Optional.of(adminUser));
            when(passwordEncoder.matches("adminpass", adminUser.getPasswordHash())).thenReturn(true);

            AuthResponse response = authService.login(request, CLIENT_IP, "TestAgent");

            assertThat(response.isTotpRequired()).isTrue();
        }

        @Test
        @DisplayName("Admin mit gueltigem TOTP-Code erhält Tokens")
        void adminLogin_validTotpCode_returnsTokens() {
            LoginRequest request = new LoginRequest("admin@halisaha.at", "adminpass", "123456");

            when(userRepository.findByEmail("admin@halisaha.at")).thenReturn(Optional.of(adminUser));
            when(passwordEncoder.matches("adminpass", adminUser.getPasswordHash())).thenReturn(true);
            when(cryptoUtil.decrypt("JBSWY3DPEHPK3PXP")).thenReturn("JBSWY3DPEHPK3PXP");
            when(totpService.verifyCode("JBSWY3DPEHPK3PXP", 123456)).thenReturn(true);
            when(jwtUtil.generateAccessToken(2L, "admin@halisaha.at", "ADMIN")).thenReturn("admin-access");
            when(jwtUtil.generateRefreshToken(2L)).thenReturn("admin-refresh");

            AuthResponse response = authService.login(request, CLIENT_IP, "TestAgent");

            assertThat(response.getAccessToken()).isEqualTo("admin-access");
            assertThat(response.getRefreshToken()).isEqualTo("admin-refresh");
            assertThat(response.getRole()).isEqualTo(UserRole.ADMIN);
            assertThat(response.isTotpRequired()).isFalse();
        }

        @Test
        @DisplayName("Admin mit falschem TOTP-Code wirft BadCredentialsException")
        void adminLogin_invalidTotpCode_throwsBadCredentials() {
            LoginRequest request = new LoginRequest("admin@halisaha.at", "adminpass", "999999");

            when(userRepository.findByEmail("admin@halisaha.at")).thenReturn(Optional.of(adminUser));
            when(passwordEncoder.matches("adminpass", adminUser.getPasswordHash())).thenReturn(true);
            when(cryptoUtil.decrypt("JBSWY3DPEHPK3PXP")).thenReturn("JBSWY3DPEHPK3PXP");
            when(totpService.verifyCode("JBSWY3DPEHPK3PXP", 999999)).thenReturn(false);

            assertThatThrownBy(() -> authService.login(request, CLIENT_IP, "TestAgent"))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Ungültiger 2FA-Code");

            verify(rateLimiter).recordAttempt("login:" + CLIENT_IP);
        }

        @Test
        @DisplayName("Admin mit nicht-numerischem TOTP-Code wirft BadCredentialsException")
        void adminLogin_nonNumericTotpCode_throwsBadCredentials() {
            LoginRequest request = new LoginRequest("admin@halisaha.at", "adminpass", "abc123");

            when(userRepository.findByEmail("admin@halisaha.at")).thenReturn(Optional.of(adminUser));
            when(passwordEncoder.matches("adminpass", adminUser.getPasswordHash())).thenReturn(true);

            assertThatThrownBy(() -> authService.login(request, CLIENT_IP, "TestAgent"))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Ungültiger 2FA-Code");

            verify(rateLimiter).recordAttempt("login:" + CLIENT_IP);
        }

        @Test
        @DisplayName("Normaler User ohne TOTP-Secret braucht keinen Code")
        void regularUser_noTotpSecret_loginWithoutCode() {
            LoginRequest request = new LoginRequest("max@example.com", "password123", null);

            when(userRepository.findByEmail("max@example.com")).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("password123", testUser.getPasswordHash())).thenReturn(true);
            when(jwtUtil.generateAccessToken(anyLong(), anyString(), anyString())).thenReturn("token");
            when(jwtUtil.generateRefreshToken(anyLong())).thenReturn("refresh");

            AuthResponse response = authService.login(request, CLIENT_IP, "TestAgent");

            assertThat(response.isTotpRequired()).isFalse();
            assertThat(response.getAccessToken()).isNotNull();
            verify(totpService, never()).verifyCode(anyString(), anyInt());
        }
    }


    @Nested
    @DisplayName("Registrierung")
    class RegisterTests {

        @Test
        @DisplayName("Erfolgreiche Registrierung erstellt Benutzer mit Tokens")
        void register_success_createsUserWithTokens() {
            RegisterRequest request = new RegisterRequest("Neuer User", "neu@example.com", "+43123456", "securepass");

            when(userRepository.existsByEmail("neu@example.com")).thenReturn(false);
            when(passwordEncoder.encode("securepass")).thenReturn("$2a$10$encodedpass");
            when(userRepository.findByDisplayId(anyString())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId(3L);
                return u;
            });
            when(jwtUtil.generateAccessToken(eq(3L), eq("neu@example.com"), eq("USER"))).thenReturn("new-access");
            when(jwtUtil.generateRefreshToken(3L)).thenReturn("new-refresh");

            AuthResponse response = authService.register(request, "127.0.0.1", "Test-Agent");

            assertThat(response.getAccessToken()).isEqualTo("new-access");
            assertThat(response.getRefreshToken()).isEqualTo("new-refresh");
            assertThat(response.getName()).isEqualTo("Neuer User");
            assertThat(response.getEmail()).isEqualTo("neu@example.com");
            assertThat(response.getRole()).isEqualTo(UserRole.USER);
            assertThat(response.isTotpRequired()).isFalse();
        }

        @Test
        @DisplayName("Registrierung mit existierender E-Mail wirft IllegalArgumentException")
        void register_duplicateEmail_throwsIllegalArgument() {
            RegisterRequest request = new RegisterRequest("User", "max@example.com", null, "password");

            when(userRepository.existsByEmail("max@example.com")).thenReturn(true);

            assertThatThrownBy(() -> authService.register(request, "127.0.0.1", "Test-Agent"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Diese E-Mail-Adresse ist bereits registriert.");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Registrierung trimmt und lowercase Email")
        void register_trimsAndLowercasesEmail() {
            RegisterRequest request = new RegisterRequest("Test User", "  TEST@Example.COM  ", null, "password123");

            when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
            when(userRepository.findByDisplayId(anyString())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId(4L);
                return u;
            });
            when(jwtUtil.generateAccessToken(anyLong(), anyString(), anyString())).thenReturn("t");
            when(jwtUtil.generateRefreshToken(anyLong())).thenReturn("r");

            authService.register(request, "127.0.0.1", "Test-Agent");

            verify(userRepository).existsByEmail("test@example.com");
        }

        @Test
        @DisplayName("Registrierung setzt Rolle auf USER")
        void register_setsRoleToUser() {
            RegisterRequest request = new RegisterRequest("User", "test@test.com", null, "password123");

            when(userRepository.existsByEmail("test@test.com")).thenReturn(false);
            when(userRepository.findByDisplayId(anyString())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId(5L);
                assertThat(u.getRole()).isEqualTo(UserRole.USER);
                return u;
            });
            when(jwtUtil.generateAccessToken(anyLong(), anyString(), anyString())).thenReturn("t");
            when(jwtUtil.generateRefreshToken(anyLong())).thenReturn("r");

            authService.register(request, "127.0.0.1", "Test-Agent");

            verify(userRepository).save(argThat(u -> u.getRole() == UserRole.USER));
        }
    }


    @Nested
    @DisplayName("Token-Erneuerung")
    class RefreshTokenTests {

        @Test
        @DisplayName("Guelitiger Refresh-Token gibt neue Tokens zurueck")
        void refreshToken_valid_returnsNewTokens() {
            when(jwtUtil.validateToken("valid-refresh")).thenReturn(true);
            when(jwtUtil.isRefreshToken("valid-refresh")).thenReturn(true);
            when(jwtUtil.extractUserId("valid-refresh")).thenReturn(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(jwtUtil.generateAccessToken(1L, "max@example.com", "USER")).thenReturn("new-access");
            when(jwtUtil.generateRefreshToken(1L)).thenReturn("new-refresh");

            AuthResponse response = authService.refreshToken("valid-refresh", CLIENT_IP);

            assertThat(response.getAccessToken()).isEqualTo("new-access");
            assertThat(response.getRefreshToken()).isEqualTo("new-refresh");
            assertThat(response.getDisplayId()).isEqualTo("HS-2026-001");
        }

        @Test
        @DisplayName("Ungueltiger Token wirft UnauthorizedException")
        void refreshToken_invalidToken_throwsUnauthorized() {
            when(jwtUtil.validateToken("invalid")).thenReturn(false);

            assertThatThrownBy(() -> authService.refreshToken("invalid", CLIENT_IP))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessage("Ungültiger Refresh-Token");
        }

        @Test
        @DisplayName("Access-Token statt Refresh-Token wirft UnauthorizedException")
        void refreshToken_accessTokenUsed_throwsUnauthorized() {
            when(jwtUtil.validateToken("access-token")).thenReturn(true);
            when(jwtUtil.isRefreshToken("access-token")).thenReturn(false);

            assertThatThrownBy(() -> authService.refreshToken("access-token", CLIENT_IP))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessage("Ungültiger Token-Typ");
        }

        @Test
        @DisplayName("Refresh-Token fuer nicht existierenden User wirft ResourceNotFoundException")
        void refreshToken_userNotFound_throwsResourceNotFound() {
            when(jwtUtil.validateToken("orphan-token")).thenReturn(true);
            when(jwtUtil.isRefreshToken("orphan-token")).thenReturn(true);
            when(jwtUtil.extractUserId("orphan-token")).thenReturn(999L);
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.refreshToken("orphan-token", CLIENT_IP))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Refresh-Token fuer deaktivierten User wirft UnauthorizedException")
        void refreshToken_inactiveUser_throwsUnauthorized() {
            testUser.setActive(false);

            when(jwtUtil.validateToken("refresh")).thenReturn(true);
            when(jwtUtil.isRefreshToken("refresh")).thenReturn(true);
            when(jwtUtil.extractUserId("refresh")).thenReturn(1L);
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> authService.refreshToken("refresh", CLIENT_IP))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessage("Benutzerkonto ist deaktiviert");
        }
    }


    @Nested
    @DisplayName("TOTP-Einrichtung")
    class TotpSetupTests {

        @Test
        @DisplayName("Admin kann TOTP einrichten")
        void setupTotp_admin_returnsSecretAndQr() {
            adminUser.setTotpSecret(null);

            when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));
            when(totpService.generateSecret()).thenReturn("NEW_SECRET");
            when(cryptoUtil.encrypt("NEW_SECRET")).thenReturn("NEW_SECRET");
            when(totpService.generateQrCodeUri("NEW_SECRET", "admin@halisaha.at"))
                    .thenReturn("otpauth://totp/HaliSaha:admin@halisaha.at?secret=NEW_SECRET");

            TotpSetupResponse response = authService.setupTotp(2L);

            assertThat(response.getSecret()).isEqualTo("NEW_SECRET");
            assertThat(response.getQrCodeUri()).contains("otpauth://totp/");
            verify(userRepository).save(argThat(u -> "NEW_SECRET".equals(u.getPendingTotpSecret())));
        }

        @Test
        @DisplayName("Normaler User kann TOTP nicht einrichten")
        void setupTotp_regularUser_throwsUnauthorized() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> authService.setupTotp(1L))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessage("2FA ist nur für Administratoren verfügbar");
        }

        @Test
        @DisplayName("TOTP-Setup fuer nicht existierenden User wirft ResourceNotFoundException")
        void setupTotp_userNotFound_throwsNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.setupTotp(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }


    @Nested
    @DisplayName("TOTP-Verifizierung")
    class TotpVerifyTests {

        @Test
        @DisplayName("Gueltiger Code verifiziert TOTP erfolgreich")
        void verifyAndEnable_validCode_returnsTrue() {
            when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));
            when(cryptoUtil.decrypt("JBSWY3DPEHPK3PXP")).thenReturn("JBSWY3DPEHPK3PXP");
            when(totpService.verifyCode("JBSWY3DPEHPK3PXP", 123456)).thenReturn(true);

            boolean result = authService.verifyAndEnableTotp(2L, 123456);

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("Ungueltiger Code gibt false zurueck")
        void verifyAndEnable_invalidCode_returnsFalse() {
            when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));
            when(cryptoUtil.decrypt("JBSWY3DPEHPK3PXP")).thenReturn("JBSWY3DPEHPK3PXP");
            when(totpService.verifyCode("JBSWY3DPEHPK3PXP", 999999)).thenReturn(false);

            boolean result = authService.verifyAndEnableTotp(2L, 999999);

            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("Verifizierung ohne vorheriges Setup wirft IllegalArgumentException")
        void verifyAndEnable_noSecretSetup_throwsIllegalArgument() {
            adminUser.setTotpSecret(null);

            when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));

            assertThatThrownBy(() -> authService.verifyAndEnableTotp(2L, 123456))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("2FA wurde noch nicht eingerichtet");
        }
    }


    @Nested
    @DisplayName("TOTP-Deaktivierung")
    class TotpDisableTests {

        @Test
        @DisplayName("TOTP kann deaktiviert werden")
        void disableTotp_success_removesSecret() {
            when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));

            authService.disableTotp(2L);

            verify(userRepository).save(argThat(u -> u.getTotpSecret() == null));
        }

        @Test
        @DisplayName("Deaktivierung fuer nicht existierenden User wirft ResourceNotFoundException")
        void disableTotp_userNotFound_throwsNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.disableTotp(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
