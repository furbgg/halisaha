package com.halisaha.auth;

import com.halisaha.auth.entity.ActiveSession;
import com.halisaha.auth.repository.ActiveSessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private ActiveSessionRepository sessionRepository;

    @InjectMocks
    private SessionService sessionService;

    @Test
    void createSession_shouldSaveSessionWithHashedToken() {
        String refreshToken = "raw-refresh-token";
        String expectedHash = sessionService.hashToken(refreshToken);
        ActiveSession mockSession = new ActiveSession();
        when(sessionRepository.save(any(ActiveSession.class))).thenReturn(mockSession);

        sessionService.createSession(1L, refreshToken, "PostmanRuntime/7.32.3", "127.0.0.1");

        ArgumentCaptor<ActiveSession> captor = ArgumentCaptor.forClass(ActiveSession.class);
        verify(sessionRepository).save(captor.capture());

        ActiveSession saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(1L);
        assertThat(saved.getTokenHash()).isEqualTo(expectedHash);
        assertThat(saved.getIpAddress()).isEqualTo("127.0.0.1");
        assertThat(saved.getRevoked()).isFalse();
    }

    @Test
    void createSession_shouldParseUserAgentCorrectly() {
        String chromeWindowsUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/100.0 Safari/537.36";
        when(sessionRepository.save(any(ActiveSession.class))).thenReturn(new ActiveSession());

        sessionService.createSession(1L, "token", chromeWindowsUA, "1.1.1.1");

        ArgumentCaptor<ActiveSession> captor = ArgumentCaptor.forClass(ActiveSession.class);
        verify(sessionRepository).save(captor.capture());

        ActiveSession saved = captor.getValue();
        assertThat(saved.getDeviceInfo()).isEqualTo("Chrome — Windows");
    }

    @Test
    void isTokenRevoked_shouldReturnFalse_whenSessionExists() {
        String token = "valid-token";
        String hash = sessionService.hashToken(token);
        when(sessionRepository.findByTokenHashAndRevokedFalse(hash)).thenReturn(Optional.of(new ActiveSession()));

        boolean result = sessionService.isTokenRevoked(token);

        assertThat(result).isFalse();
    }

    @Test
    void isTokenRevoked_shouldReturnTrue_whenSessionNotFound() {
        String token = "invalid-token";
        String hash = sessionService.hashToken(token);
        when(sessionRepository.findByTokenHashAndRevokedFalse(hash)).thenReturn(Optional.empty());

        boolean result = sessionService.isTokenRevoked(token);

        assertThat(result).isTrue();
    }

    @Test
    void isTokenRevoked_shouldReturnTrue_whenSessionRevoked() {
        String token = "revoked-token";
        String hash = sessionService.hashToken(token);
        when(sessionRepository.findByTokenHashAndRevokedFalse(hash)).thenReturn(Optional.empty());

        boolean result = sessionService.isTokenRevoked(token);

        assertThat(result).isTrue();
    }

    @Test
    void updateLastUsed_shouldUpdateTimestamp() {
        String token = "some-token";
        String hash = sessionService.hashToken(token);
        ActiveSession session = new ActiveSession();
        when(sessionRepository.findByTokenHashAndRevokedFalse(hash)).thenReturn(Optional.of(session));

        sessionService.updateLastUsed(token);

        verify(sessionRepository).save(session);
        assertThat(session.getLastUsedAt()).isNotNull();
    }

    @Test
    void revokeSession_shouldSetRevokedTrue() {
        ActiveSession session = new ActiveSession();
        session.setUserId(1L);
        session.setRevoked(false);
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));

        boolean result = sessionService.revokeSession(100L, 1L);

        assertThat(result).isTrue();
        assertThat(session.getRevoked()).isTrue();
        verify(sessionRepository).save(session);
    }

    @Test
    void revokeSession_shouldReturnFalse_whenNotOwnSession() {
        ActiveSession session = new ActiveSession();
        session.setUserId(2L);
        when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));

        boolean result = sessionService.revokeSession(100L, 1L);

        assertThat(result).isFalse();
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void revokeAllOtherSessions_shouldKeepCurrentSession() {
        String token = "current-token";
        String hash = sessionService.hashToken(token);
        when(sessionRepository.revokeAllOtherSessions(1L, hash)).thenReturn(5);

        int result = sessionService.revokeAllOtherSessions(1L, token);

        assertThat(result).isEqualTo(5);
        verify(sessionRepository).revokeAllOtherSessions(1L, hash);
    }

    @Test
    void cleanupExpiredSessions_shouldDeleteOldRevokedSessions() {
        when(sessionRepository.deleteRevokedBefore(any())).thenReturn(10);

        sessionService.cleanupExpiredSessions();

        verify(sessionRepository).deleteRevokedBefore(any());
    }

    @Test
    void hashToken_shouldProduceSameHashForSameInput() {
        String token = "my-secret-token";
        String hash1 = sessionService.hashToken(token);
        String hash2 = sessionService.hashToken(token);

        assertThat(hash1).isEqualTo(hash2);
    }

    @Test
    void hashToken_shouldProduceDifferentHashForDifferentInput() {
        String hash1 = sessionService.hashToken("token1");
        String hash2 = sessionService.hashToken("token2");

        assertThat(hash1).isNotEqualTo(hash2);
    }
}
