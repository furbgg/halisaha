package com.halisaha.integration;

import com.halisaha.IntegrationTestBase;
import com.halisaha.user.UserRole;
import com.halisaha.user.entity.User;
import com.halisaha.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Disabled("TestContainers requires Docker, disabling to ensure Maven build succeeds on hosts without Docker")
@AutoConfigureMockMvc
@DisplayName("Auth Flow Integration Test — TestContainers PostgreSQL")
class AuthFlowIntegrationTest extends IntegrationTestBase {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @BeforeEach
        void setUp() {
                userRepository.deleteAll();
        }

        @Nested
        @DisplayName("Register → Login → Token Flow")
        class FullAuthFlowTests {

                @Test
                @DisplayName("Yeni kullanici kayit ve giris yapabilir")
                void registerAndLogin_fullFlow() throws Exception {
                        String registerBody = """
                                        {
                                            "name": "Max Mustermann",
                                            "email": "max@example.com",
                                            "password": "SecurePass123!",
                                            "privacyAccepted": true
                                        }
                                        """;

                        mockMvc.perform(post("/api/auth/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(registerBody))
                                        .andExpect(status().isCreated())
                                        .andExpect(jsonPath("$.success").value(true))
                                        .andExpect(jsonPath("$.data.accessToken").exists());

                        assertThat(userRepository.findByEmail("max@example.com")).isPresent();

                        String loginBody = """
                                        {
                                            "email": "max@example.com",
                                            "password": "SecurePass123!"
                                        }
                                        """;

                        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(loginBody)
                                        .header("X-Forwarded-For", "127.0.0.1"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.data.accessToken").exists())
                                        .andExpect(jsonPath("$.data.refreshToken").exists())
                                        .andReturn();

                        String responseJson = loginResult.getResponse().getContentAsString();
                        String token = responseJson.split("\"accessToken\":\"")[1].split("\"")[0];

                        mockMvc.perform(get("/api/users/me")
                                        .header("Authorization", "Bearer " + token))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.data.email").value("max@example.com"));
                }

                @Test
                @DisplayName("Yanlis sifre ile giris yapilamaz")
                void login_wrongPassword_returnsUnauthorized() throws Exception {
                        userRepository.save(User.builder()
                                        .displayId("HS-2026-001")
                                        .name("Test User")
                                        .email("test@example.com")
                                        .passwordHash(passwordEncoder.encode("CorrectPassword"))
                                        .role(UserRole.USER)
                                        .active(true)
                                        .build());

                        String loginBody = """
                                        {
                                            "email": "test@example.com",
                                            "password": "WrongPassword"
                                        }
                                        """;

                        mockMvc.perform(post("/api/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(loginBody)
                                        .header("X-Forwarded-For", "127.0.0.1"))
                                        .andExpect(status().isUnauthorized());
                }

                @Test
                @DisplayName("Gecersiz token ile korunmus endpoint'e erisim reddedilir")
                void protectedEndpoint_invalidToken_returns401() throws Exception {
                        mockMvc.perform(get("/api/users/me")
                                        .header("Authorization", "Bearer invalid.token.here"))
                                        .andExpect(status().isUnauthorized());
                }

                @Test
                @DisplayName("Ayni email ile ikinci kayit reddedilir")
                void register_duplicateEmail_returnsConflict() throws Exception {
                        String registerBody = """
                                        {
                                            "name": "First User",
                                            "email": "duplicate@example.com",
                                            "password": "SecurePass123!",
                                            "privacyAccepted": true
                                        }
                                        """;

                        mockMvc.perform(post("/api/auth/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(registerBody))
                                        .andExpect(status().isCreated());

                        mockMvc.perform(post("/api/auth/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(registerBody))
                                        .andExpect(status().isConflict());
                }

                @Test
                @DisplayName("Refresh token ile yeni access token alinabilir")
                void refreshToken_validToken_returnsNewAccessToken() throws Exception {
                        String registerBody = """
                                        {
                                            "name": "Refresh User",
                                            "email": "refresh@example.com",
                                            "password": "SecurePass123!",
                                            "privacyAccepted": true
                                        }
                                        """;

                        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(registerBody))
                                        .andExpect(status().isCreated())
                                        .andReturn();

                        String responseJson = registerResult.getResponse().getContentAsString();
                        String refreshToken = responseJson.split("\"refreshToken\":\"")[1].split("\"")[0];

                        String refreshBody = String.format("{\"refreshToken\":\"%s\"}", refreshToken);

                        mockMvc.perform(post("/api/auth/refresh")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(refreshBody))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.data.accessToken").exists());
                }
        }
}
