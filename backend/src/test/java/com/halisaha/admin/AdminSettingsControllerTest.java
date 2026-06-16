package com.halisaha.admin;

import com.halisaha.common.entity.AppSetting;
import com.halisaha.common.exception.GlobalExceptionHandler;
import com.halisaha.common.repository.AppSettingRepository;
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
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminSettingsController — Einstellungsverwaltung")
class AdminSettingsControllerTest {

    @Mock
    private AppSettingRepository appSettingRepository;

    @InjectMocks
    private AdminSettingsController adminSettingsController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminSettingsController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("GET /admin/settings")
    class GetAllTests {

        @Test
        @DisplayName("Alle Einstellungen abrufen gibt 200 zurueck")
        void getAll_returns200() throws Exception {
            AppSetting s1 = AppSetting.builder().key("site.name").value("HaliSaha").build();
            AppSetting s2 = AppSetting.builder().key("slot.hold.minutes").value("5").build();
            when(appSettingRepository.findAll()).thenReturn(List.of(s1, s2));

            mockMvc.perform(get("/admin/settings"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(2));
        }
    }

    @Nested
    @DisplayName("PUT /admin/settings/{key}")
    class UpdateTests {

        @Test
        @DisplayName("Vorhandene Einstellung aktualisieren gibt 200 zurueck")
        void update_existing_returns200() throws Exception {
            AppSetting existing = AppSetting.builder().key("site.name").value("Old").build();
            when(appSettingRepository.findById("site.name")).thenReturn(Optional.of(existing));
            when(appSettingRepository.save(any(AppSetting.class))).thenReturn(existing);

            mockMvc.perform(put("/admin/settings/site.name")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"value\":\"Neuer Name\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Einstellung aktualisiert"));
        }

        @Test
        @DisplayName("Neue Einstellung erstellen gibt 200 zurueck")
        void update_newSetting_createsAndReturns200() throws Exception {
            when(appSettingRepository.findById("new.key")).thenReturn(Optional.empty());
            when(appSettingRepository.save(any(AppSetting.class))).thenAnswer(inv -> inv.getArgument(0));

            mockMvc.perform(put("/admin/settings/new.key")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"value\":\"new-value\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Einstellung aktualisiert"));
        }

        @Test
        @DisplayName("Leerer Body gibt 400 zurueck")
        void update_emptyBody_returns400() throws Exception {
            mockMvc.perform(put("/admin/settings/some.key")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(""))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Fehlender Content-Type gibt 415 zurueck")
        void update_missingContentType_returns415() throws Exception {
            mockMvc.perform(put("/admin/settings/some.key")
                            .content("{\"value\":\"test\"}"))
                    .andExpect(status().isUnsupportedMediaType());
        }

        @Test
        @DisplayName("Repository-Fehler gibt 500 zurueck")
        void update_repositoryError_returns500() throws Exception {
            when(appSettingRepository.findById("error.key")).thenReturn(Optional.empty());
            when(appSettingRepository.save(any())).thenThrow(new RuntimeException("DB error"));

            mockMvc.perform(put("/admin/settings/error.key")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"value\":\"test\"}"))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("GET /admin/settings — Leere Liste")
    class GetAllEmptyTests {

        @Test
        @DisplayName("Keine Einstellungen gibt leere Liste zurueck")
        void getAll_empty_returnsEmptyArray() throws Exception {
            when(appSettingRepository.findAll()).thenReturn(List.of());

            mockMvc.perform(get("/admin/settings"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(0));
        }
    }
}
