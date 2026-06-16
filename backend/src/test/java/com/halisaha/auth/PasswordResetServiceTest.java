package com.halisaha.auth;

import com.halisaha.auth.entity.PasswordResetToken;
import com.halisaha.auth.repository.PasswordResetTokenRepository;
import com.halisaha.common.AppConstants;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.user.entity.User;
import com.halisaha.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.ZonedDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService passwordResetService;

    @Test
    void createResetToken_shouldCreateToken_whenUserExists() {
        User user = new User();
        user.setId(1L);
        user.setEmail("admin@example.com");
        user.setActive(true);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));

        String token = passwordResetService.createResetToken("admin@example.com");

        assertThat(token).isNotBlank();
        verify(tokenRepository).invalidateAllTokensForUser(1L);
        verify(tokenRepository).save(any(PasswordResetToken.class));
    }

    @Test
    void createResetToken_shouldNotRevealUserExistence_whenUserDoesNotExist() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        String token = passwordResetService.createResetToken("unknown@example.com");

        assertThat(token).isNull();
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void resetPassword_shouldUpdatePassword_whenTokenValid() {
        User user = new User();
        user.setId(1L);
        user.setPasswordHash("old-hash");

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash("hashed-token");
        token.setUsed(false);
        token.setExpiresAt(ZonedDateTime.now(AppConstants.VIENNA).plusHours(1));

        when(tokenRepository.findByTokenHashAndUsedFalse(anyString())).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("new-password")).thenReturn("new-hash");

        passwordResetService.resetPassword("valid-token", "new-password");

        assertThat(user.getPasswordHash()).isEqualTo("new-hash");
        assertThat(token.getUsed()).isTrue();
        verify(userRepository).save(user);
        verify(tokenRepository).save(token);
        verify(tokenRepository).invalidateAllTokensForUser(1L);
    }

    @Test
    void resetPassword_shouldThrow_whenTokenExpired() {
        PasswordResetToken token = new PasswordResetToken();
        token.setTokenHash("hashed-expired-token");
        token.setExpiresAt(ZonedDateTime.now(AppConstants.VIENNA).minusHours(1));

        when(tokenRepository.findByTokenHashAndUsedFalse(anyString())).thenReturn(Optional.of(token));

        assertThrows(IllegalArgumentException.class,
                () -> passwordResetService.resetPassword("expired-token", "new-pwd"));
    }

    @Test
    void resetPassword_shouldThrow_whenTokenAlreadyUsedOrNotFound() {
        when(tokenRepository.findByTokenHashAndUsedFalse(anyString())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> passwordResetService.resetPassword("used-token", "new-pwd"));
    }

    @Test
    void validateToken_shouldReturnEmail_whenTokenValid() {
        User user = new User();
        user.setEmail("test@test.com");
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setExpiresAt(ZonedDateTime.now(AppConstants.VIENNA).plusHours(1));

        when(tokenRepository.findByTokenHashAndUsedFalse(anyString())).thenReturn(Optional.of(token));

        String email = passwordResetService.validateToken("xyz");

        assertThat(email).isEqualTo("test@test.com");
    }
}
