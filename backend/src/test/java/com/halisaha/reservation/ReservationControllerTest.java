package com.halisaha.reservation;

import com.halisaha.common.AppConstants;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.halisaha.common.exception.GlobalExceptionHandler;
import com.halisaha.equipment.EquipmentService;
import com.halisaha.equipment.entity.Equipment;
import com.halisaha.reservation.dto.CreateReservationRequest;
import com.halisaha.reservation.dto.ModifyReservationRequest;
import com.halisaha.reservation.dto.ReservationResponse;
import com.halisaha.reservation.dto.SlotHoldRequest;
import com.halisaha.reservation.entity.SlotHold;
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

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReservationController — Oeffentliche Reservierungs-Endpunkte")
class ReservationControllerTest {

        @Mock
        private ReservationService reservationService;
        @Mock
        private SlotHoldService slotHoldService;
        @Mock
        private EquipmentService equipmentService;
        @Mock
        private com.halisaha.auth.LoginRateLimiter rateLimiter;

        @InjectMocks
        private ReservationController reservationController;

        private MockMvc mockMvc;
        private ObjectMapper objectMapper;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders.standaloneSetup(reservationController)
                                .setControllerAdvice(new GlobalExceptionHandler())
                                .build();
                objectMapper = new ObjectMapper();
                objectMapper.registerModule(new JavaTimeModule());
                
                lenient().doNothing().when(rateLimiter).checkRateLimit(anyString());
        }


        @Nested
        @DisplayName("POST /reservations")
        class CreateReservationTests {

                @Test
                @DisplayName("Erfolgreiche Reservierung gibt 201 zurueck")
                void create_success_returns201() throws Exception {
                        ReservationResponse response = ReservationResponse.builder()
                                        .confirmationCode("RES-TEST01")
                                        .fieldName("Platz 1")
                                        .totalPrice(new BigDecimal("100.00"))
                                        .build();
                        when(reservationService.createReservation(any(CreateReservationRequest.class), isNull()))
                                        .thenReturn(response);

                        CreateReservationRequest request = new CreateReservationRequest();
                        request.setGameType("FOOTBALL");
                        request.setFieldId(1L);
                        request.setStartTime(ZonedDateTime.of(2026, 4, 1, 18, 0, 0, 0, AppConstants.VIENNA));
                        request.setDurationMinutes(60);
                        request.setPrivacyAccepted(true);
                        request.setGuestName("Max");
                        request.setGuestEmail("max@test.com");
                        request.setGuestPhone("+43123");

                        mockMvc.perform(post("/reservations")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isCreated())
                                        .andExpect(jsonPath("$.success").value(true))
                                        .andExpect(jsonPath("$.data.confirmationCode").value("RES-TEST01"));
                }

                @Test
                @DisplayName("Authentifizierter Benutzer uebergibt userId")
                void create_authenticated_passesUserId() throws Exception {
                        ReservationResponse response = ReservationResponse.builder()
                                        .confirmationCode("RES-AUTH01")
                                        .build();
                        when(reservationService.createReservation(any(CreateReservationRequest.class), eq(5L)))
                                        .thenReturn(response);

                        CreateReservationRequest request = new CreateReservationRequest();
                        request.setGameType("FOOTBALL");
                        request.setFieldId(1L);
                        request.setStartTime(ZonedDateTime.of(2026, 4, 1, 18, 0, 0, 0, AppConstants.VIENNA));
                        request.setDurationMinutes(90);
                        request.setPrivacyAccepted(true);

                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(5L, null,
                                        List.of());

                        mockMvc.perform(post("/reservations")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request))
                                        .principal(auth))
                                        .andExpect(status().isCreated())
                                        .andExpect(jsonPath("$.data.confirmationCode").value("RES-AUTH01"));
                }

                @Test
                @DisplayName("Fehlende Pflichtfelder geben 400 zurueck")
                void create_missingFields_returns400() throws Exception {
                        String body = "{\"fieldId\": 1}";

                        mockMvc.perform(post("/reservations")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(body))
                                        .andExpect(status().isBadRequest());
                }
        }


        @Nested
        @DisplayName("GET /reservations/{confirmationCode}")
        class GetReservationTests {

                @Test
                @DisplayName("Vorhandene Reservierung gibt 200 zurueck")
                void get_existingCode_returns200() throws Exception {
                        ReservationResponse response = ReservationResponse.builder()
                                        .confirmationCode("RES-FOUND")
                                        .fieldName("Platz 2")
                                        .build();
                        when(reservationService.getByConfirmationCodePublic(eq("RES-FOUND"), isNull(), isNull())).thenReturn(response);

                        mockMvc.perform(get("/reservations/RES-FOUND"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.data.confirmationCode").value("RES-FOUND"))
                                        .andExpect(jsonPath("$.data.fieldName").value("Platz 2"));
                }
        }


        @Nested
        @DisplayName("PUT /reservations/{confirmationCode}")
        class ModifyReservationTests {

                @Test
                @DisplayName("Erfolgreiche Aenderung gibt 200 zurueck")
                void modify_success_returns200() throws Exception {
                        ReservationResponse response = ReservationResponse.builder()
                                        .confirmationCode("RES-MOD01")
                                        .build();
                        when(reservationService.modifyReservation(eq("RES-MOD01"), any(), eq(120), isNull(), isNull(), eq(false)))
                                        .thenReturn(response);

                        ModifyReservationRequest request = new ModifyReservationRequest(
                                        ZonedDateTime.of(2026, 4, 1, 19, 0, 0, 0, AppConstants.VIENNA), 120);

                        mockMvc.perform(put("/reservations/RES-MOD01")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.message").value("Reservierung geaendert"));
                }
        }


        @Nested
        @DisplayName("DELETE /reservations/{confirmationCode}")
        class CancelReservationTests {

                @Test
                @DisplayName("Erfolgreiche Stornierung gibt 200 zurueck")
                void cancel_success_returns200() throws Exception {
                        ReservationResponse response = ReservationResponse.builder()
                                        .confirmationCode("RES-CAN01")
                                        .status(ReservationStatus.CANCELLED)
                                        .build();
                        when(reservationService.cancelReservation(eq("RES-CAN01"), isNull(), isNull(), eq(false))).thenReturn(response);

                        mockMvc.perform(delete("/reservations/RES-CAN01"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.message").value("Reservierung storniert"));
                }
        }


        @Nested
        @DisplayName("POST /reservations/hold")
        class CreateHoldTests {

                @Test
                @DisplayName("Hold erstellen gibt 201 zurueck")
                void createHold_success_returns201() throws Exception {
                        SlotHold hold = SlotHold.builder()
                                        .sessionId("sess-123")
                                        .build();
                        when(slotHoldService.createHold(eq(1L), any(), eq(60), eq("sess-123")))
                                        .thenReturn(hold);

                        SlotHoldRequest request = new SlotHoldRequest(
                                        1L, ZonedDateTime.of(2026, 4, 1, 18, 0, 0, 0, AppConstants.VIENNA), 60, "sess-123");

                        mockMvc.perform(post("/reservations/hold")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(objectMapper.writeValueAsString(request)))
                                        .andExpect(status().isCreated())
                                        .andExpect(jsonPath("$.success").value(true));
                }
        }


        @Nested
        @DisplayName("DELETE /reservations/hold/{sessionId}")
        class ReleaseHoldTests {

                @Test
                @DisplayName("Hold freigeben gibt 200 zurueck")
                void releaseHold_success_returns200() throws Exception {
                        doNothing().when(slotHoldService).releaseHold("sess-123");

                        mockMvc.perform(delete("/reservations/hold/sess-123"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.message").value("Reservierung freigegeben"));
                }
        }


        @Nested
        @DisplayName("GET /equipment/rentable")
        class GetRentableEquipmentTests {

                @Test
                @DisplayName("Gibt Liste mietbarer Ausruestung zurueck")
                void getRentable_returns200WithList() throws Exception {
                        Equipment eq1 = Equipment.builder().id(1L).name("Krampon").build();
                        Equipment eq2 = Equipment.builder().id(2L).name("Ball").build();
                        when(equipmentService.getRentableEquipment()).thenReturn(List.of(eq1, eq2));

                        mockMvc.perform(get("/equipment/rentable"))
                                        .andExpect(status().isOk())
                                        .andExpect(jsonPath("$.data").isArray())
                                        .andExpect(jsonPath("$.data.length()").value(2));
                }
        }
}
