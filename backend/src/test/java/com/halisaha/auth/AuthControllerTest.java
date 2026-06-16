package com.halisaha.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.halisaha.auth.dto.AuthResponse;
import com.halisaha.auth.dto.LoginRequest;
import com.halisaha.auth.dto.RefreshTokenRequest;
import com.halisaha.auth.dto.RegisterRequest;
import com.halisaha.auth.dto.TotpSetupResponse;
import com.halisaha.auth.dto.TotpVerifyRequest;
import com.halisaha.common.exception.GlobalExceptionHandler;
import com.halisaha.common.exception.RateLimitExceededException;
import com.halisaha.common.exception.UnauthorizedException;
import com.halisaha.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthController — HTTP-Endpunkte fuer Authentifizierung")
class AuthControllerTest {

        @Mock
        private AuthService authService;

        @InjectMocks
        private AuthController authController;

        private MockMvc mockMvc;
        private ObjectMapper objectMapper;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.standaloneSetup(authController)
                                .setControllerAdvice(new GlobalExceptionHandler())
                                .build();
                objectMapper = new ObjectMapper();
        }


        @Nested
        @DisplayName("POST /auth/login")
        class LoginEndpointTests {

                @Test
                @DisplayName("Erfolgreicher Login gibt 200 mit Tokens zurueck")
                void login_success_returns200WithTokens() throws Exception {
                        AuthResponse authResponse = AuthResponse.builder()
                                        .accessToken("access-token-123")
                                        .refreshToken("refresh-token-456")
                                        .displayId("HS-2026-001")
                                        .name("Max Mustermann")
                                        .email("max@example.com")
                                        .role(UserRole.USER)
                                        .totpRequired(false)
                                        .build();

                        when(authService.login(any(LoginRequest.class), anyString(), any()))
                                        .thenReturn(authResponse);

                        LoginRequest request = new LoginRequest("max@example.com", "Password1!", null);

                        mockMvc.perform(post("/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.success").value(true))
                                        .andExpect(jsonPath("$.message").value("Erfolgreich angemeldet"))
                                        .andExpect(jsonPath("$.data.accessToken").value("access-token-123"))
                                        .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                                        .andExpect(jsonPath("$.data.name").value("Max Mustermann"));
                }

                @Test
                @DisplayName("Login mit TOTP-Anforderung gibt 200 mit totpRequired=true zurueck")
                void login_totpRequired_returns200WithTotpFlag() throws Exception {
                        AuthResponse authResponse = AuthResponse.builder()
                                        .totpRequired(true)
                                        .build();

                        when(authService.login(any(LoginRequest.class), anyString(), any()))
                                        .thenReturn(authResponse);

                        LoginRequest request = new LoginRequest("admin@test.com", "password", null);

                        mockMvc.perform(post("/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.message").value("2FA-Code erforderlich"))
                                        .andExpect(jsonPath("$.data.totpRequired").value(true));
                }

                @Test
                @DisplayName("Login ohne E-Mail gibt 400 zurueck")
                void login_noEmail_returns400() throws Exception {
                        String body = "{\"password\":\"test123\"}";

                        mockMvc.perform(post("/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(body))
                                        .andExpect(status().isBadRequest());
                }

                @Test
                @DisplayName("Login ohne Passwort gibt 400 zurueck")
                void login_noPassword_returns400() throws Exception {
                        String body = "{\"email\":\"test@test.com\"}";

                        mockMvc.perform(post("/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(body))
                                        .andExpect(status().isBadRequest());
                }

        @Test
        @DisplayName("Login mit Rate-Limit gibt 429 zurueck")
        void login_rateLimited_returns429() throws Exception {
            when(authService.login(any(LoginRequest.class), anyString(), any()))
                    .thenThrow(new RateLimitExceededException("Zu viele Versuche"));

            LoginRequest request = new LoginRequest("test@test.com", "password", null);

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isTooManyRequests());
        }

        @Test
        @DisplayName("Login mit falschen Anmeldedaten gibt 401 zurueck")
        void login_badCredentials_returns401() throws Exception {
            when(authService.login(any(LoginRequest.class), anyString(), any()))
                    .thenThrow(new BadCredentialsException("Ungültige Anmeldedaten"));

            LoginRequest request = new LoginRequest("test@test.com", "wrong", null);

            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }
        }


        @Nested
        @DisplayName("POST /auth/register")
        class RegisterEndpointTests {

                @Test
                @DisplayName("Erfolgreiche Registrierung gibt 201 zurueck")
                void register_success_returns201() throws Exception {
                        AuthResponse authResponse = AuthResponse.builder()
                                        .accessToken("new-access")
                                        .refreshToken("new-refresh")
                                        .displayId("HS-2026-005")
                                        .name("Neuer User")
                                        .email("neu@test.com")
                                        .role(UserRole.USER)
                                        .totpRequired(false)
                                        .build();

                        when(authService.register(any(RegisterRequest.class), anyString(), any())).thenReturn(authResponse);

                        RegisterRequest request = new RegisterRequest("Neuer User", "neu@test.com", "+43123",
                                        "Password1!");

                        mockMvc.perform(post("/auth/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isCreated())
                                        .andExpect(jsonPath("$.success").value(true))
                                        .andExpect(jsonPath("$.message").value("Erfolgreich registriert"))
                                        .andExpect(jsonPath("$.data.displayId").value("HS-2026-005"));
                }

        @Test
        @DisplayName("Registrierung mit existierender E-Mail gibt 400 zurueck")
        void register_duplicateEmail_returns400() throws Exception {
            when(authService.register(any(RegisterRequest.class), anyString(), any()))
                    .thenThrow(new IllegalArgumentException("Diese E-Mail-Adresse ist bereits registriert."));

            RegisterRequest request = new RegisterRequest("User", "existing@test.com", null, "Password1!");

            mockMvc.perform(post("/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

                @Test
                @DisplayName("Registrierung ohne Name gibt 400 zurueck")
                void register_noName_returns400() throws Exception {
                        String body = "{\"email\":\"test@test.com\",\"password\":\"password123\"}";

                        mockMvc.perform(post("/auth/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(body))
                                        .andExpect(status().isBadRequest());
                }

                @Test
                @DisplayName("Registrierung mit zu kurzem Passwort gibt 400 zurueck")
                void register_shortPassword_returns400() throws Exception {
                        RegisterRequest request = new RegisterRequest("User", "test@test.com", null, "short");

                        mockMvc.perform(post("/auth/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isBadRequest());
                }
        }


        @Nested
        @DisplayName("POST /auth/refresh")
        class RefreshEndpointTests {

                @Test
                @DisplayName("Token-Erneuerung gibt 200 mit neuen Tokens zurueck")
                void refresh_success_returns200() throws Exception {
                        AuthResponse authResponse = AuthResponse.builder()
                                        .accessToken("new-access")
                                        .refreshToken("new-refresh")
                                        .displayId("HS-2026-001")
                                        .name("Max")
                                        .email("max@test.com")
                                        .role(UserRole.USER)
                                        .totpRequired(false)
                                        .build();

                        when(authService.refreshToken(eq("valid-refresh"), anyString())).thenReturn(authResponse);

                        RefreshTokenRequest request = new RefreshTokenRequest("valid-refresh");

                        mockMvc.perform(post("/auth/refresh")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.data.accessToken").value("new-access"));
                }

        @Test
        @DisplayName("Ungueltiger Refresh-Token gibt 401 zurueck")
        void refresh_invalidToken_returns401() throws Exception {
            when(authService.refreshToken(eq("invalid"), anyString()))
                    .thenThrow(new UnauthorizedException("Ungültiger Refresh-Token"));

            RefreshTokenRequest request = new RefreshTokenRequest("invalid");

            mockMvc.perform(post("/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

                @Test
                @DisplayName("Leerer Refresh-Token gibt 400 zurueck")
                void refresh_emptyToken_returns400() throws Exception {
                        String body = "{\"refreshToken\":\"\"}";

                        mockMvc.perform(post("/auth/refresh")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(body))
                                        .andExpect(status().isUnauthorized());
                }
        }


        @Nested
        @DisplayName("2FA-Endpunkte")
        class TwoFactorEndpointTests {

                private UsernamePasswordAuthenticationToken adminAuth;

                @BeforeEach
                void setUp() {
                        adminAuth = new UsernamePasswordAuthenticationToken(
                                        2L, null,
                                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
                }

                @Test
                @DisplayName("GET /auth/2fa/setup gibt QR-Code-Daten zurueck")
                void setup2fa_admin_returnsQrCode() throws Exception {
                        TotpSetupResponse setupResponse = TotpSetupResponse.builder()
                                        .secret("JBSWY3DPEHPK3PXP")
                                        .qrCodeUri("otpauth://totp/HaliSaha:admin@test.com?secret=JBSWY3DPEHPK3PXP")
                                        .build();

                        when(authService.setupTotp(2L)).thenReturn(setupResponse);

                        mockMvc.perform(get("/auth/2fa/setup")
                                        .principal(adminAuth))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.data.secret").value("JBSWY3DPEHPK3PXP"))
                                        .andExpect(jsonPath("$.data.qrCodeUri").exists());
                }

        @Test
        @DisplayName("POST /auth/2fa/verify mit gueltigem Code gibt 200 zurueck")
        void verify2fa_validCode_returns200() throws Exception {
            when(authService.verifyAndEnableTotp(2L, 123456)).thenReturn(true);

            TotpVerifyRequest request = new TotpVerifyRequest(123456);

            mockMvc.perform(post("/auth/2fa/verify")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .principal(adminAuth))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("2FA erfolgreich aktiviert"));
        }

        @Test
        @DisplayName("POST /auth/2fa/verify mit ungueltigem Code gibt 400 zurueck")
        void verify2fa_invalidCode_returns400() throws Exception {
            when(authService.verifyAndEnableTotp(2L, 999999)).thenReturn(false);

            TotpVerifyRequest request = new TotpVerifyRequest(999999);

            mockMvc.perform(post("/auth/2fa/verify")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .principal(adminAuth))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success").value(false));
        }

                @Test
                @DisplayName("DELETE /auth/2fa deaktiviert 2FA")
                void disable2fa_returns200() throws Exception {
                        doNothing().when(authService).disableTotp(2L);

                        mockMvc.perform(delete("/auth/2fa")
                                        .principal(adminAuth))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.message").value("2FA deaktiviert"));
                }
        }
}
