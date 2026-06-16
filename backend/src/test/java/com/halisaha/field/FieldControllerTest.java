package com.halisaha.field;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.halisaha.common.exception.GlobalExceptionHandler;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.field.dto.FieldAvailabilityResponse;
import com.halisaha.field.entity.Field;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FieldController — Saha-Endpunkte (Public + Admin)")
class FieldControllerTest {

    @Mock
    private FieldService fieldService;

    @InjectMocks
    private FieldController fieldController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(fieldController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }


    @Nested
    @DisplayName("GET /fields")
    class GetAllFieldsTests {

        @Test
        @DisplayName("Gibt alle aktiven Felder zurueck")
        void getAll_returns200WithFields() throws Exception {
            Field f1 = Field.builder().id(1L).name("Platz 1").active(true).build();
            Field f2 = Field.builder().id(2L).name("Platz 2").active(true).build();
            when(fieldService.getAllActiveFields()).thenReturn(List.of(f1, f2));

            mockMvc.perform(get("/fields"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(2))
                    .andExpect(jsonPath("$.data[0].name").value("Platz 1"));
        }

        @Test
        @DisplayName("Leere Liste bei keinen aktiven Feldern")
        void getAll_noFields_returnsEmptyList() throws Exception {
            when(fieldService.getAllActiveFields()).thenReturn(List.of());

            mockMvc.perform(get("/fields"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(0));
        }
    }


    @Nested
    @DisplayName("GET /fields/{id}")
    class GetFieldTests {

        @Test
        @DisplayName("Vorhandenes Feld gibt 200 zurueck")
        void getField_existing_returns200() throws Exception {
            Field field = Field.builder().id(1L).name("Platz 1").build();
            when(fieldService.getFieldById(1L)).thenReturn(field);

            mockMvc.perform(get("/fields/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.name").value("Platz 1"));
        }

        @Test
        @DisplayName("Nicht vorhandenes Feld gibt 404 zurueck")
        void getField_notFound_returns404() throws Exception {
            when(fieldService.getFieldById(999L))
                    .thenThrow(new ResourceNotFoundException("Platz nicht gefunden"));

            mockMvc.perform(get("/fields/999"))
                    .andExpect(status().isNotFound());
        }
    }


    @Nested
    @DisplayName("GET /fields/{id}/availability")
    class GetAvailabilityTests {

        @Test
        @DisplayName("Verfuegbarkeit fuer gueltige Parameter gibt 200 zurueck")
        void getAvailability_valid_returns200() throws Exception {
            FieldAvailabilityResponse availability = FieldAvailabilityResponse.builder()
                    .fieldId(1L)
                    .fieldName("Platz 1")
                    .date(LocalDate.of(2026, 4, 1))
                    .build();
            when(fieldService.getAvailability(eq(1L), any(LocalDate.class), eq(1)))
                    .thenReturn(availability);

            mockMvc.perform(get("/fields/1/availability")
                    .param("date", "2026-04-01")
                    .param("duration", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.fieldName").value("Platz 1"));
        }
    }


    @Nested
    @DisplayName("POST /admin/fields")
    class CreateFieldTests {

        @Test
        @DisplayName("Neues Feld erstellen gibt 201 zurueck")
        void createField_success_returns201() throws Exception {
            Field field = Field.builder()
                    .id(3L).name("Platz 3")
                    .hourlyPrice(new BigDecimal("80.00"))
                    .openingTime(LocalTime.of(9, 0))
                    .closingTime(LocalTime.of(23, 0))
                    .active(true)
                    .build();
            when(fieldService.createField(any(Field.class))).thenReturn(field);

            String body = objectMapper.writeValueAsString(field);

            mockMvc.perform(post("/admin/fields")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message").value("Platz erstellt"))
                    .andExpect(jsonPath("$.data.name").value("Platz 3"));
        }
    }


    @Nested
    @DisplayName("PUT /admin/fields/{id}")
    class UpdateFieldTests {

        @Test
        @DisplayName("Feld aktualisieren gibt 200 zurueck")
        void updateField_success_returns200() throws Exception {
            Field updated = Field.builder().id(1L).name("Platz 1 Premium").build();
            when(fieldService.updateField(eq(1L), any(Field.class))).thenReturn(updated);

            mockMvc.perform(put("/admin/fields/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"name\": \"Platz 1 Premium\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Platz aktualisiert"));
        }
    }


    @Nested
    @DisplayName("DELETE /admin/fields/{id}")
    class DeleteFieldTests {

        @Test
        @DisplayName("Feld deaktivieren gibt 200 zurueck")
        void deleteField_success_returns200() throws Exception {
            doNothing().when(fieldService).deleteField(1L);

            mockMvc.perform(delete("/admin/fields/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Platz deaktiviert"));
        }
    }
}
