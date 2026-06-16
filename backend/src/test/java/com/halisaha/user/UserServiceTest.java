package com.halisaha.user;

import com.halisaha.common.AppConstants;

import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.reservation.ReservationService;
import com.halisaha.reservation.dto.ReservationResponse;
import com.halisaha.user.dto.UpdateProfileRequest;
import com.halisaha.user.dto.UserProfileResponse;
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

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService — Benutzerverwaltung & DSGVO")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ReservationService reservationService;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .displayId("USR-ABC123")
                .name("Max Mustermann")
                .email("max@test.com")
                .phone("+43 660 1234567")
                .passwordHash("$2a$10$hashedpassword")
                .role(UserRole.USER)
                .totpSecret(null)
                .active(true)
                .createdAt(ZonedDateTime.of(2026, 1, 15, 10, 0, 0, 0, AppConstants.VIENNA))
                .build();
    }


    @Nested
    @DisplayName("Profil anzeigen")
    class GetProfileTests {

        @Test
        @DisplayName("Profil erfolgreich abrufen")
        void getProfile_success() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            UserProfileResponse response = userService.getProfile(1L);

            assertThat(response.getDisplayId()).isEqualTo("USR-ABC123");
            assertThat(response.getName()).isEqualTo("Max Mustermann");
            assertThat(response.getEmail()).isEqualTo("max@test.com");
            assertThat(response.getPhone()).isEqualTo("+43 660 1234567");
            assertThat(response.getRole()).isEqualTo(UserRole.USER);
            assertThat(response.isTotpEnabled()).isFalse();
        }

        @Test
        @DisplayName("Profil mit TOTP aktiviert zeigt totpEnabled=true")
        void getProfile_withTotp_showsTotpEnabled() {
            testUser.setTotpSecret("JBSWY3DPEHPK3PXP");
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

            UserProfileResponse response = userService.getProfile(1L);

            assertThat(response.isTotpEnabled()).isTrue();
        }

        @Test
        @DisplayName("Nicht existierender Benutzer wirft ResourceNotFoundException")
        void getProfile_userNotFound_throwsNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getProfile(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("nicht gefunden");
        }
    }


    @Nested
    @DisplayName("Profil aktualisieren")
    class UpdateProfileTests {

        @Test
        @DisplayName("Name und Telefonnummer erfolgreich aktualisieren")
        void updateProfile_success() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            UpdateProfileRequest request = new UpdateProfileRequest("Neuer Name", "+43 660 9999999");
            userService.updateProfile(1L, request);

            assertThat(testUser.getName()).isEqualTo("Neuer Name");
            assertThat(testUser.getPhone()).isEqualTo("+43 660 9999999");
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("Leerer Name wird ignoriert")
        void updateProfile_blankName_isIgnored() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            UpdateProfileRequest request = new UpdateProfileRequest("   ", "+43 660 5555555");
            userService.updateProfile(1L, request);

            assertThat(testUser.getName()).isEqualTo("Max Mustermann");
            assertThat(testUser.getPhone()).isEqualTo("+43 660 5555555");
        }

        @Test
        @DisplayName("Null Name wird ignoriert")
        void updateProfile_nullName_isIgnored() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            UpdateProfileRequest request = new UpdateProfileRequest(null, null);
            userService.updateProfile(1L, request);

            assertThat(testUser.getName()).isEqualTo("Max Mustermann");
        }

        @Test
        @DisplayName("Name wird getrimmt")
        void updateProfile_nameIsTrimmed() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            UpdateProfileRequest request = new UpdateProfileRequest("  Ali Yilmaz  ", null);
            userService.updateProfile(1L, request);

            assertThat(testUser.getName()).isEqualTo("Ali Yilmaz");
        }
    }


    @Nested
    @DisplayName("Benutzerreservierungen abrufen")
    class GetUserReservationsTests {

        @Test
        @DisplayName("Delegiert an ReservationService")
        void getUserReservations_delegatesToReservationService() {
            List<ReservationResponse> mockReservations = List.of(
                    ReservationResponse.builder().confirmationCode("RES-001").build(),
                    ReservationResponse.builder().confirmationCode("RES-002").build());
            when(reservationService.getUserReservations(1L)).thenReturn(mockReservations);

            List<ReservationResponse> result = userService.getUserReservations(1L);

            assertThat(result).hasSize(2);
            verify(reservationService).getUserReservations(1L);
        }
    }


    @Nested
    @DisplayName("DSGVO — Kontolöschung (Anonymisierung)")
    class DeleteAccountTests {

        @Test
        @DisplayName("Account wird anonymisiert, nicht physisch gelöscht")
        void deleteAccount_anonymizesUserData() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            userService.deleteAccount(1L);

            assertThat(testUser.getName()).isEqualTo("Gelöschter Benutzer");
            assertThat(testUser.getEmail()).isEqualTo("deleted_1@anonymized.local");
            assertThat(testUser.getPhone()).isNull();
            assertThat(testUser.getPasswordHash()).isEqualTo("DELETED");
            assertThat(testUser.getTotpSecret()).isNull();
            assertThat(testUser.getActive()).isFalse();
            verify(userRepository).save(testUser);
        }

        @Test
        @DisplayName("Nicht existierende Konto-Löschung schlägt fehl")
        void deleteAccount_userNotFound_throwsNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deleteAccount(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }


    @Nested
    @DisplayName("DSGVO — Datenexport")
    class ExportUserDataTests {

        @Test
        @DisplayName("Exportierte Daten enthalten alle Pflichtfelder")
        void exportUserData_containsAllRequiredFields() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            when(reservationService.getUserReservations(1L)).thenReturn(List.of());

            Map<String, Object> data = userService.exportUserData(1L);

            assertThat(data).containsKeys("displayId", "name", "email", "phone", "role", "createdAt", "reservations");
            assertThat(data.get("displayId")).isEqualTo("USR-ABC123");
            assertThat(data.get("name")).isEqualTo("Max Mustermann");
            assertThat(data.get("email")).isEqualTo("max@test.com");
            assertThat(data.get("role")).isEqualTo("USER");
        }

        @Test
        @DisplayName("Exportierte Daten enthalten Reservierungen")
        void exportUserData_includesReservations() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
            List<ReservationResponse> reservations = List.of(
                    ReservationResponse.builder().confirmationCode("RES-X1").build()
            );
            when(reservationService.getUserReservations(1L)).thenReturn(reservations);

            Map<String, Object> data = userService.exportUserData(1L);

            @SuppressWarnings("unchecked")
            List<ReservationResponse> exported = (List<ReservationResponse>) data.get("reservations");
            assertThat(exported).hasSize(1);
            assertThat(exported.get(0).getConfirmationCode()).isEqualTo("RES-X1");
        }

        @Test
        @DisplayName("Export fehlgeschlagen bei nicht existierendem Benutzer")
        void exportUserData_userNotFound_throwsNotFound() {
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.exportUserData(999L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
