package com.halisaha.reservation;

import com.halisaha.common.AppConstants;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.halisaha.common.exception.GlobalExceptionHandler;
import com.halisaha.common.service.AuditLogService;
import com.halisaha.reservation.dto.ModifyReservationRequest;
import com.halisaha.reservation.dto.ReservationResponse;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.ZonedDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminReservationController — Admin-Reservierungsverwaltung")
class AdminReservationControllerTest {

    @Mock
    private ReservationService reservationService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AdminReservationController adminReservationController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private UsernamePasswordAuthenticationToken adminAuth;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminReservationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        adminAuth = new UsernamePasswordAuthenticationToken(
                1L, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    @Nested
    @DisplayName("GET /admin/reservations")
    class GetAllReservationsTests {

        @Test
        @DisplayName("Alle Reservierungen abrufen gibt 200 zurueck")
        void getAll_returns200() throws Exception {
            when(reservationService.getReservationsByDateRange(any(), any()))
                    .thenReturn(List.of(ReservationResponse.builder().confirmationCode("RES-1").build()));

            mockMvc.perform(get("/admin/reservations"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray());
        }

        @Test
        @DisplayName("Mit Datumsfilter abrufen gibt 200 zurueck")
        void getAll_withDateRange_returns200() throws Exception {
            when(reservationService.getReservationsByDateRange(any(), any()))
                    .thenReturn(List.of());

            mockMvc.perform(get("/admin/reservations")
                            .param("from", "2026-03-01")
                            .param("to", "2026-03-31"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray());
        }
    }

    @Nested
    @DisplayName("GET /admin/reservations/today")
    class GetTodayTests {

        @Test
        @DisplayName("Heutige Reservierungen abrufen gibt 200 zurueck")
        void getToday_returns200() throws Exception {
            when(reservationService.getTodayReservations()).thenReturn(List.of());

            mockMvc.perform(get("/admin/reservations/today"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray());
        }
    }

    @Nested
    @DisplayName("GET /admin/reservations/{id}")
    class GetByIdTests {

        @Test
        @DisplayName("Reservierung nach ID abrufen gibt 200 zurueck")
        void getById_returns200() throws Exception {
            ReservationResponse response = ReservationResponse.builder()
                    .confirmationCode("RES-42").build();
            when(reservationService.getById(42L)).thenReturn(response);

            mockMvc.perform(get("/admin/reservations/42"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.confirmationCode").value("RES-42"));
        }
    }

    @Nested
    @DisplayName("PUT /admin/reservations/{id}")
    class ModifyTests {

        @Test
        @DisplayName("Admin-Aenderung gibt 200 zurueck und loggt Audit")
        void modify_returns200_logsAudit() throws Exception {
            ReservationResponse before = ReservationResponse.builder().confirmationCode("RES-MOD").build();
            ReservationResponse after = ReservationResponse.builder().confirmationCode("RES-MOD").build();
            when(reservationService.getById(1L)).thenReturn(before);
            when(reservationService.adminModifyReservation(eq(1L), any(), eq(120))).thenReturn(after);

            ModifyReservationRequest request = new ModifyReservationRequest(
                    ZonedDateTime.of(2026, 4, 1, 20, 0, 0, 0, AppConstants.VIENNA), 120);

            mockMvc.perform(put("/admin/reservations/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
                    .principal(adminAuth))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Reservierung geändert"));

            verify(auditLogService).logAction(eq(1L), eq("MODIFY"), eq("RESERVATION"),
                    eq(1L), any(), any(), any());
        }
    }

    @Nested
    @DisplayName("DELETE /admin/reservations/{id}")
    class CancelTests {

        @Test
        @DisplayName("Admin-Stornierung gibt 200 zurueck und loggt Audit")
        void cancel_returns200_logsAudit() throws Exception {
            ReservationResponse before = ReservationResponse.builder().confirmationCode("RES-CAN").build();
            ReservationResponse after = ReservationResponse.builder()
                    .confirmationCode("RES-CAN").status(ReservationStatus.CANCELLED).build();
            when(reservationService.getById(1L)).thenReturn(before);
            when(reservationService.adminCancelReservation(1L)).thenReturn(after);

            mockMvc.perform(delete("/admin/reservations/1").principal(adminAuth))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Reservierung storniert"));

            verify(auditLogService).logAction(eq(1L), eq("CANCEL"), eq("RESERVATION"),
                    eq(1L), any(), any(), any());
        }
    }
}
