package com.halisaha.staff;

import com.halisaha.common.exception.GlobalExceptionHandler;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.staff.entity.Staff;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminStaffController — Mitarbeiterverwaltung")
class AdminStaffControllerTest {

    @Mock
    private StaffService staffService;

    @InjectMocks
    private AdminStaffController adminStaffController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminStaffController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("GET /admin/staff")
    class GetAllTests {

        @Test
        @DisplayName("Alle Mitarbeiter abrufen gibt 200 zurueck")
        void getAll_returns200() throws Exception {
            Staff s1 = Staff.builder().id(1L).name("Ali").build();
            Staff s2 = Staff.builder().id(2L).name("Mehmet").build();
            when(staffService.getAll()).thenReturn(List.of(s1, s2));

            mockMvc.perform(get("/admin/staff"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(2));
        }
    }

    @Nested
    @DisplayName("GET /admin/staff/{id}")
    class GetByIdTests {

        @Test
        @DisplayName("Vorhandener Mitarbeiter gibt 200 zurueck")
        void getById_found_returns200() throws Exception {
            Staff staff = Staff.builder().id(1L).name("Ali").build();
            when(staffService.getById(1L)).thenReturn(staff);

            mockMvc.perform(get("/admin/staff/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.name").value("Ali"));
        }

        @Test
        @DisplayName("Nicht vorhandener Mitarbeiter gibt 404 zurueck")
        void getById_notFound_returns404() throws Exception {
            when(staffService.getById(999L))
                    .thenThrow(new ResourceNotFoundException("Mitarbeiter nicht gefunden"));

            mockMvc.perform(get("/admin/staff/999"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /admin/staff")
    class CreateTests {

        @Test
        @DisplayName("Neuen Mitarbeiter erstellen gibt 201 zurueck")
        void create_returns201() throws Exception {
            Staff created = Staff.builder().id(3L).name("Neuer").build();
            when(staffService.create(any(Staff.class))).thenReturn(created);

            mockMvc.perform(post("/admin/staff")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"name\":\"Neuer\",\"role\":\"REFEREE\"}"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message").value("Mitarbeiter erstellt"));
        }
    }

    @Nested
    @DisplayName("PUT /admin/staff/{id}")
    class UpdateTests {

        @Test
        @DisplayName("Mitarbeiter aktualisieren gibt 200 zurueck")
        void update_returns200() throws Exception {
            Staff updated = Staff.builder().id(1L).name("Updated").build();
            when(staffService.update(eq(1L), any(Staff.class))).thenReturn(updated);

            mockMvc.perform(put("/admin/staff/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"name\":\"Updated\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Mitarbeiter aktualisiert"));
        }
    }

    @Nested
    @DisplayName("DELETE /admin/staff/{id}")
    class DeleteTests {

        @Test
        @DisplayName("Mitarbeiter deaktivieren gibt 200 zurueck")
        void delete_returns200() throws Exception {
            doNothing().when(staffService).delete(1L);

            mockMvc.perform(delete("/admin/staff/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Mitarbeiter deaktiviert"));
        }
    }
}
