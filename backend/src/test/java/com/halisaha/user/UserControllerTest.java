package com.halisaha.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.halisaha.common.exception.GlobalExceptionHandler;
import com.halisaha.reservation.dto.ReservationResponse;
import com.halisaha.user.dto.UpdateProfileRequest;
import com.halisaha.user.dto.UserProfileResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserController — Benutzerprofil & DSGVO-Endpunkte")
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private UsernamePasswordAuthenticationToken userAuth;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        userAuth = new UsernamePasswordAuthenticationToken(1L, null, List.of());
    }


    @Nested
    @DisplayName("GET /users/me")
    class GetProfileTests {

        @Test
        @DisplayName("Profil abrufen gibt 200 zurueck")
        void getProfile_returns200() throws Exception {
            UserProfileResponse profile = UserProfileResponse.builder()
                    .displayId("USR-001")
                    .name("Max Mustermann")
                    .email("max@test.com")
                    .role(UserRole.USER)
                    .build();
            when(userService.getProfile(1L)).thenReturn(profile);

            mockMvc.perform(get("/users/me").principal(userAuth))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.displayId").value("USR-001"))
                    .andExpect(jsonPath("$.data.name").value("Max Mustermann"));
        }
    }


    @Nested
    @DisplayName("PUT /users/me")
    class UpdateProfileTests {

        @Test
        @DisplayName("Profil aktualisieren gibt 200 zurueck")
        void updateProfile_returns200() throws Exception {
            UserProfileResponse updated = UserProfileResponse.builder()
                    .displayId("USR-001")
                    .name("Neuer Name")
                    .build();
            when(userService.updateProfile(eq(1L), any(UpdateProfileRequest.class))).thenReturn(updated);

            UpdateProfileRequest request = new UpdateProfileRequest("Neuer Name", "+43 660 123");

            mockMvc.perform(put("/users/me")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
                    .principal(userAuth))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Profil aktualisiert"))
                    .andExpect(jsonPath("$.data.name").value("Neuer Name"));
        }
    }


    @Nested
    @DisplayName("GET /users/me/reservations")
    class GetMyReservationsTests {

        @Test
        @DisplayName("Reservierungen abrufen gibt 200 zurueck")
        void getMyReservations_returns200() throws Exception {
            List<ReservationResponse> reservations = List.of(
                    ReservationResponse.builder().confirmationCode("RES-001").build(),
                    ReservationResponse.builder().confirmationCode("RES-002").build());
            when(userService.getUserReservations(1L)).thenReturn(reservations);

            mockMvc.perform(get("/users/me/reservations").principal(userAuth))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(2));
        }
    }


    @Nested
    @DisplayName("DELETE /users/me — DSGVO Kontolöschung")
    class DeleteAccountTests {

        @Test
        @DisplayName("Kontolöschung gibt 200 zurueck")
        void deleteAccount_returns200() throws Exception {
            doNothing().when(userService).deleteAccount(1L);

            mockMvc.perform(delete("/users/me").principal(userAuth))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Konto gelöscht"));
        }
    }


    @Nested
    @DisplayName("GET /users/me/export — DSGVO Datenexport")
    class ExportDataTests {

        @Test
        @DisplayName("Datenexport gibt 200 mit Benutzerinfos zurueck")
        void exportData_returns200WithData() throws Exception {
            Map<String, Object> data = Map.of(
                    "displayId", "USR-001",
                    "name", "Max Mustermann",
                    "email", "max@test.com");
            when(userService.exportUserData(1L)).thenReturn(data);

            mockMvc.perform(get("/users/me/export").principal(userAuth))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.displayId").value("USR-001"))
                    .andExpect(jsonPath("$.data.name").value("Max Mustermann"));
        }
    }


    @Nested
    @DisplayName("Fehlerbehandlung")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Profil — Benutzer nicht gefunden gibt 404 zurueck")
        void getProfile_userNotFound_returns404() throws Exception {
            when(userService.getProfile(1L))
                    .thenThrow(new com.halisaha.common.exception.ResourceNotFoundException("Benutzer nicht gefunden"));

            mockMvc.perform(get("/users/me").principal(userAuth))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @DisplayName("Profil aktualisieren — Benutzer nicht gefunden gibt 404 zurueck")
        void updateProfile_userNotFound_returns404() throws Exception {
            when(userService.updateProfile(eq(1L), any(UpdateProfileRequest.class)))
                    .thenThrow(new com.halisaha.common.exception.ResourceNotFoundException("Benutzer nicht gefunden"));

            UpdateProfileRequest request = new UpdateProfileRequest("Test", "+43123");

            mockMvc.perform(put("/users/me")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .principal(userAuth))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Kontolöschung — Benutzer nicht gefunden gibt 404 zurueck")
        void deleteAccount_userNotFound_returns404() throws Exception {
            doThrow(new com.halisaha.common.exception.ResourceNotFoundException("Benutzer nicht gefunden"))
                    .when(userService).deleteAccount(1L);

            mockMvc.perform(delete("/users/me").principal(userAuth))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Reservierungen — leere Liste gibt 200 mit leerem Array zurueck")
        void getMyReservations_empty_returns200WithEmptyArray() throws Exception {
            when(userService.getUserReservations(1L)).thenReturn(List.of());

            mockMvc.perform(get("/users/me/reservations").principal(userAuth))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(0));
        }

        @Test
        @DisplayName("Datenexport — Service-Fehler gibt 500 zurueck")
        void exportData_serviceError_returns500() throws Exception {
            when(userService.exportUserData(1L)).thenThrow(new RuntimeException("Export failed"));

            mockMvc.perform(get("/users/me/export").principal(userAuth))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        @DisplayName("Profil aktualisieren — leerer Body gibt 400 zurueck")
        void updateProfile_emptyBody_returns400() throws Exception {
            mockMvc.perform(put("/users/me")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}")
                            .principal(userAuth))
                    .andExpect(status().isOk());
        }
    }
}
