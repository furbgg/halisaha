package com.halisaha.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtAuthenticationFilter — HTTP-Request-Filterung")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpServletResponse response;
    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }


    @Nested
    @DisplayName("Ohne Authorization-Header")
    class NoAuthHeaderTests {

        @Test
        @DisplayName("Ohne Header wird Filterchain fortgesetzt ohne Authentifizierung")
        void noAuthHeader_continuesChainWithoutAuth() throws Exception {
            when(request.getHeader("Authorization")).thenReturn(null);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("Leerer Header wird ignoriert")
        void emptyAuthHeader_continuesChainWithoutAuth() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("");

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("Nicht-Bearer-Header wird ignoriert")
        void nonBearerHeader_continuesChainWithoutAuth() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }
    }


    @Nested
    @DisplayName("Ungueltiger Token")
    class InvalidTokenTests {

        @Test
        @DisplayName("Abgelaufener Token wird nicht authentifiziert")
        void expiredToken_continuesChainWithoutAuth() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer expired-token");
            when(jwtUtil.validateToken("expired-token")).thenReturn(false);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("Manipulierter Token wird nicht authentifiziert")
        void tamperedToken_continuesChainWithoutAuth() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer tampered-jwt");
            when(jwtUtil.validateToken("tampered-jwt")).thenReturn(false);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }
    }


    @Nested
    @DisplayName("Refresh-Token-Ablehnung")
    class RefreshTokenRejectionTests {

        @Test
        @DisplayName("Refresh-Token wird nicht fuer Authentifizierung verwendet")
        void refreshToken_continuesChainWithoutAuth() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer valid-refresh-token");
            when(jwtUtil.validateToken("valid-refresh-token")).thenReturn(true);
            when(jwtUtil.isRefreshToken("valid-refresh-token")).thenReturn(true);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
            verify(jwtUtil, never()).extractUserId(anyString());
        }
    }


    @Nested
    @DisplayName("Gueltiger Access-Token")
    class ValidAccessTokenTests {

        @Test
        @DisplayName("Gueltiger Access-Token setzt Authentication im SecurityContext")
        void validAccessToken_setsAuthentication() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer valid-access-token");
            when(jwtUtil.validateToken("valid-access-token")).thenReturn(true);
            when(jwtUtil.isRefreshToken("valid-access-token")).thenReturn(false);
            when(jwtUtil.extractUserId("valid-access-token")).thenReturn(42L);
            when(jwtUtil.extractRole("valid-access-token")).thenReturn("USER");

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain).doFilter(request, response);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            assertThat(auth).isNotNull();
            assertThat(auth.getPrincipal()).isEqualTo(42L);
            assertThat(auth.getAuthorities()).hasSize(1);
            assertThat(auth.getAuthorities().iterator().next().getAuthority()).isEqualTo("ROLE_USER");
        }

        @Test
        @DisplayName("Admin-Token setzt ROLE_ADMIN-Authority")
        void adminToken_setsAdminRole() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer admin-token");
            when(jwtUtil.validateToken("admin-token")).thenReturn(true);
            when(jwtUtil.isRefreshToken("admin-token")).thenReturn(false);
            when(jwtUtil.extractUserId("admin-token")).thenReturn(1L);
            when(jwtUtil.extractRole("admin-token")).thenReturn("ADMIN");

            filter.doFilterInternal(request, response, filterChain);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            assertThat(auth).isNotNull();
            assertThat(auth.getAuthorities().iterator().next().getAuthority()).isEqualTo("ROLE_ADMIN");
        }

        @Test
        @DisplayName("UserId wird als Principal gesetzt")
        void validToken_setsUserIdAsPrincipal() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer user-token");
            when(jwtUtil.validateToken("user-token")).thenReturn(true);
            when(jwtUtil.isRefreshToken("user-token")).thenReturn(false);
            when(jwtUtil.extractUserId("user-token")).thenReturn(99L);
            when(jwtUtil.extractRole("user-token")).thenReturn("USER");

            filter.doFilterInternal(request, response, filterChain);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            assertThat(auth.getPrincipal()).isEqualTo(99L);
        }

        @Test
        @DisplayName("Credentials sind null im Authentication-Objekt")
        void validToken_credentialsAreNull() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer token");
            when(jwtUtil.validateToken("token")).thenReturn(true);
            when(jwtUtil.isRefreshToken("token")).thenReturn(false);
            when(jwtUtil.extractUserId("token")).thenReturn(1L);
            when(jwtUtil.extractRole("token")).thenReturn("USER");

            filter.doFilterInternal(request, response, filterChain);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            assertThat(auth.getCredentials()).isNull();
        }
    }


    @Nested
    @DisplayName("Filterchain wird immer aufgerufen")
    class FilterChainAlwaysCalledTests {

        @Test
        @DisplayName("Filterchain wird bei fehlendem Header aufgerufen")
        void noHeader_chainCalled() throws Exception {
            when(request.getHeader("Authorization")).thenReturn(null);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain, times(1)).doFilter(request, response);
        }

        @Test
        @DisplayName("Filterchain wird bei ungueltigem Token aufgerufen")
        void invalidToken_chainCalled() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer bad");
            when(jwtUtil.validateToken("bad")).thenReturn(false);

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain, times(1)).doFilter(request, response);
        }

        @Test
        @DisplayName("Filterchain wird bei gueltigem Token aufgerufen")
        void validToken_chainCalled() throws Exception {
            when(request.getHeader("Authorization")).thenReturn("Bearer good");
            when(jwtUtil.validateToken("good")).thenReturn(true);
            when(jwtUtil.isRefreshToken("good")).thenReturn(false);
            when(jwtUtil.extractUserId("good")).thenReturn(1L);
            when(jwtUtil.extractRole("good")).thenReturn("USER");

            filter.doFilterInternal(request, response, filterChain);

            verify(filterChain, times(1)).doFilter(request, response);
        }
    }
}
