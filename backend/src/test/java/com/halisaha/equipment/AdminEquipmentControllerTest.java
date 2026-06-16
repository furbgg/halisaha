package com.halisaha.equipment;

import com.halisaha.common.exception.GlobalExceptionHandler;
import com.halisaha.equipment.entity.Equipment;
import com.halisaha.equipment.repository.EquipmentRepository;
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
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminEquipmentController — Ausruestungsverwaltung")
class AdminEquipmentControllerTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @InjectMocks
    private AdminEquipmentController adminEquipmentController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminEquipmentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("GET /admin/equipment")
    class GetAllTests {

        @Test
        @DisplayName("Alle Ausruestung abrufen gibt 200 zurueck")
        void getAll_returns200() throws Exception {
            Equipment eq1 = Equipment.builder().id(1L).name("Krampon").build();
            when(equipmentRepository.findAll()).thenReturn(List.of(eq1));

            mockMvc.perform(get("/admin/equipment"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data[0].name").value("Krampon"));
        }
    }

    @Nested
    @DisplayName("GET /admin/equipment/{id}")
    class GetByIdTests {

        @Test
        @DisplayName("Vorhandene Ausruestung gibt 200 zurueck")
        void getById_found_returns200() throws Exception {
            Equipment eq = Equipment.builder().id(1L).name("Ball").build();
            when(equipmentRepository.findById(1L)).thenReturn(Optional.of(eq));

            mockMvc.perform(get("/admin/equipment/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.name").value("Ball"));
        }

        @Test
        @DisplayName("Nicht vorhandene Ausruestung gibt 404 zurueck")
        void getById_notFound_returns404() throws Exception {
            when(equipmentRepository.findById(999L)).thenReturn(Optional.empty());

            mockMvc.perform(get("/admin/equipment/999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /admin/equipment")
    class CreateTests {

        @Test
        @DisplayName("Neue Ausruestung erstellen gibt 201 zurueck")
        void create_returns201() throws Exception {
            Equipment eq = Equipment.builder()
                    .id(3L).name("Krampon").quantity(10)
                    .rentalPricePerHour(new BigDecimal("5.00")).rentable(true)
                    .build();
            when(equipmentRepository.save(any(Equipment.class))).thenReturn(eq);

            mockMvc.perform(post("/admin/equipment")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"name\":\"Krampon\",\"quantity\":10}"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message").value("Ausrüstung erstellt"));
        }
    }

    @Nested
    @DisplayName("PUT /admin/equipment/{id}")
    class UpdateTests {

        @Test
        @DisplayName("Ausruestung aktualisieren gibt 200 zurueck")
        void update_returns200() throws Exception {
            Equipment existing = Equipment.builder()
                    .id(1L).name("Old").quantity(5).rentable(true)
                    .build();
            when(equipmentRepository.findById(1L)).thenReturn(Optional.of(existing));
            when(equipmentRepository.save(any(Equipment.class))).thenReturn(existing);

            mockMvc.perform(put("/admin/equipment/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"name\":\"NeuName\",\"quantity\":20}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Ausrüstung aktualisiert"));
        }
    }

    @Nested
    @DisplayName("DELETE /admin/equipment/{id}")
    class DeleteTests {

        @Test
        @DisplayName("Ausruestung deaktivieren gibt 200 zurueck")
        void delete_returns200() throws Exception {
            Equipment eq = Equipment.builder().id(1L).name("Ball").rentable(true).build();
            when(equipmentRepository.findById(1L)).thenReturn(Optional.of(eq));
            when(equipmentRepository.save(any(Equipment.class))).thenReturn(eq);

            mockMvc.perform(delete("/admin/equipment/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Ausrüstung deaktiviert"));
        }
    }
}
