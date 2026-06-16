package com.halisaha.auth;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JwtUtil — Token Generation, Validation & Extraction")
class JwtUtilTest {

    private JwtUtil jwtUtil;

    private static final String TEST_SECRET = "this-is-a-very-secure-secret-key-for-testing-purposes-minimum-256-bits";
    private static final long ACCESS_EXPIRATION = 900_000;
    private static final long REFRESH_EXPIRATION = 604_800_000;

    @BeforeEach
    void setUp() throws Exception {
        jwtUtil = new JwtUtil();

        setField(jwtUtil, "secret", TEST_SECRET);
        setField(jwtUtil, "accessTokenExpiration", ACCESS_EXPIRATION);
        setField(jwtUtil, "refreshTokenExpiration", REFRESH_EXPIRATION);

        jwtUtil.init();
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }


    @Nested
    @DisplayName("Access-Token-Erzeugung")
    class AccessTokenGenerationTests {

        @Test
        @DisplayName("Generiert gueltigen Access-Token")
        void generateAccessToken_returnsValidToken() {
            String token = jwtUtil.generateAccessToken(1L, "user@test.com", "USER");

            assertThat(token).isNotNull().isNotEmpty();
            assertThat(jwtUtil.validateToken(token)).isTrue();
        }

        @Test
        @DisplayName("Access-Token enthaelt korrekte Claims")
        void generateAccessToken_containsCorrectClaims() {
            String token = jwtUtil.generateAccessToken(42L, "admin@halisaha.at", "ADMIN");

            Claims claims = jwtUtil.extractClaims(token);

            assertThat(claims.getSubject()).isEqualTo("42");
            assertThat(claims.get("email", String.class)).isEqualTo("admin@halisaha.at");
            assertThat(claims.get("role", String.class)).isEqualTo("ADMIN");
        }

        @Test
        @DisplayName("Access-Token hat kein type=refresh Claim")
        void generateAccessToken_isNotRefreshToken() {
            String token = jwtUtil.generateAccessToken(1L, "user@test.com", "USER");

            assertThat(jwtUtil.isRefreshToken(token)).isFalse();
        }

        @Test
        @DisplayName("Access-Token hat korrektes Ablaufdatum")
        void generateAccessToken_hasCorrectExpiration() {
            String token = jwtUtil.generateAccessToken(1L, "user@test.com", "USER");

            Claims claims = jwtUtil.extractClaims(token);
            long expirationMillis = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();

            assertThat(expirationMillis).isBetween(ACCESS_EXPIRATION - 1000, ACCESS_EXPIRATION + 1000);
        }
    }


    @Nested
    @DisplayName("Refresh-Token-Erzeugung")
    class RefreshTokenGenerationTests {

        @Test
        @DisplayName("Generiert gueltigen Refresh-Token")
        void generateRefreshToken_returnsValidToken() {
            String token = jwtUtil.generateRefreshToken(1L);

            assertThat(token).isNotNull().isNotEmpty();
            assertThat(jwtUtil.validateToken(token)).isTrue();
        }

        @Test
        @DisplayName("Refresh-Token hat type=refresh Claim")
        void generateRefreshToken_hasRefreshTypeClaim() {
            String token = jwtUtil.generateRefreshToken(1L);

            assertThat(jwtUtil.isRefreshToken(token)).isTrue();
        }

        @Test
        @DisplayName("Refresh-Token hat laengere Gueltigkeitsdauer")
        void generateRefreshToken_hasLongerExpiration() {
            String token = jwtUtil.generateRefreshToken(1L);

            Claims claims = jwtUtil.extractClaims(token);
            long expirationMillis = claims.getExpiration().getTime() - claims.getIssuedAt().getTime();

            assertThat(expirationMillis).isBetween(REFRESH_EXPIRATION - 1000, REFRESH_EXPIRATION + 1000);
        }

        @Test
        @DisplayName("Refresh-Token enthaelt UserId")
        void generateRefreshToken_containsUserId() {
            String token = jwtUtil.generateRefreshToken(99L);

            Long userId = jwtUtil.extractUserId(token);

            assertThat(userId).isEqualTo(99L);
        }
    }


    @Nested
    @DisplayName("Token-Validierung")
    class TokenValidationTests {

        @Test
        @DisplayName("Gueltiger Token wird validiert")
        void validateToken_validToken_returnsTrue() {
            String token = jwtUtil.generateAccessToken(1L, "test@test.com", "USER");

            assertThat(jwtUtil.validateToken(token)).isTrue();
        }

        @Test
        @DisplayName("Abgelaufener Token wird abgelehnt")
        void validateToken_expiredToken_returnsFalse() throws Exception {
            JwtUtil shortLivedJwt = new JwtUtil();
            setField(shortLivedJwt, "secret", TEST_SECRET);
            setField(shortLivedJwt, "accessTokenExpiration", 1L);
            setField(shortLivedJwt, "refreshTokenExpiration", 1L);
            shortLivedJwt.init();

            String token = shortLivedJwt.generateAccessToken(1L, "test@test.com", "USER");

            Thread.sleep(50);

            assertThat(jwtUtil.validateToken(token)).isFalse();
        }

        @Test
        @DisplayName("Manipulierter Token wird abgelehnt")
        void validateToken_tamperedToken_returnsFalse() {
            String token = jwtUtil.generateAccessToken(1L, "test@test.com", "USER");
            String tampered = token.substring(0, token.length() - 5) + "XXXXX";

            assertThat(jwtUtil.validateToken(tampered)).isFalse();
        }

        @Test
        @DisplayName("Leerer String wird abgelehnt")
        void validateToken_emptyString_returnsFalse() {
            assertThatThrownBy(() -> jwtUtil.validateToken(""))
                    .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        @DisplayName("Garbage-String wird abgelehnt")
        void validateToken_garbageString_returnsFalse() {
            assertThat(jwtUtil.validateToken("not.a.jwt.token")).isFalse();
        }

        @Test
        @DisplayName("Token mit anderem Secret wird abgelehnt")
        void validateToken_differentSecret_returnsFalse() throws Exception {
            JwtUtil otherJwt = new JwtUtil();
            setField(otherJwt, "secret", "another-very-secure-secret-key-for-a-different-application-256-bits");
            setField(otherJwt, "accessTokenExpiration", ACCESS_EXPIRATION);
            setField(otherJwt, "refreshTokenExpiration", REFRESH_EXPIRATION);
            otherJwt.init();

            String token = otherJwt.generateAccessToken(1L, "test@test.com", "USER");

            assertThat(jwtUtil.validateToken(token)).isFalse();
        }
    }


    @Nested
    @DisplayName("Claim-Extraktion")
    class ClaimExtractionTests {

        @Test
        @DisplayName("ExtractUserId gibt korrekte ID zurueck")
        void extractUserId_returnsCorrectId() {
            String token = jwtUtil.generateAccessToken(42L, "test@test.com", "USER");

            assertThat(jwtUtil.extractUserId(token)).isEqualTo(42L);
        }

        @Test
        @DisplayName("ExtractEmail gibt korrekte E-Mail zurueck")
        void extractEmail_returnsCorrectEmail() {
            String token = jwtUtil.generateAccessToken(1L, "admin@halisaha.at", "ADMIN");

            assertThat(jwtUtil.extractEmail(token)).isEqualTo("admin@halisaha.at");
        }

        @Test
        @DisplayName("ExtractRole gibt korrekte Rolle zurueck")
        void extractRole_returnsCorrectRole() {
            String token = jwtUtil.generateAccessToken(1L, "test@test.com", "ADMIN");

            assertThat(jwtUtil.extractRole(token)).isEqualTo("ADMIN");
        }

        @Test
        @DisplayName("isRefreshToken erkennt Access-Token korrekt als false")
        void isRefreshToken_accessToken_returnsFalse() {
            String token = jwtUtil.generateAccessToken(1L, "test@test.com", "USER");

            assertThat(jwtUtil.isRefreshToken(token)).isFalse();
        }

        @Test
        @DisplayName("isRefreshToken erkennt Refresh-Token korrekt als true")
        void isRefreshToken_refreshToken_returnsTrue() {
            String token = jwtUtil.generateRefreshToken(1L);

            assertThat(jwtUtil.isRefreshToken(token)).isTrue();
        }
    }


    @Nested
    @DisplayName("Grenzfaelle")
    class EdgeCaseTests {

        @Test
        @DisplayName("Verschiedene User erhalten verschiedene Tokens")
        void differentUsers_getDifferentTokens() {
            String token1 = jwtUtil.generateAccessToken(1L, "user1@test.com", "USER");
            String token2 = jwtUtil.generateAccessToken(2L, "user2@test.com", "ADMIN");

            assertThat(token1).isNotEqualTo(token2);
            assertThat(jwtUtil.extractUserId(token1)).isNotEqualTo(jwtUtil.extractUserId(token2));
        }

        @Test
        @DisplayName("Access-Token und Refresh-Token sind unterscheidbar")
        void accessAndRefreshTokens_areDifferent() {
            String access = jwtUtil.generateAccessToken(1L, "test@test.com", "USER");
            String refresh = jwtUtil.generateRefreshToken(1L);

            assertThat(access).isNotEqualTo(refresh);
            assertThat(jwtUtil.isRefreshToken(access)).isFalse();
            assertThat(jwtUtil.isRefreshToken(refresh)).isTrue();
        }

        @Test
        @DisplayName("Refresh-Token hat kein Email-Claim")
        void refreshToken_hasNoEmailClaim() {
            String token = jwtUtil.generateRefreshToken(1L);

            Claims claims = jwtUtil.extractClaims(token);
            assertThat(claims.get("email")).isNull();
        }
    }
}
