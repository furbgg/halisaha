package com.halisaha.common;

import com.halisaha.common.entity.AppSetting;
import com.halisaha.common.repository.AppSettingRepository;
import com.halisaha.common.service.AppSettingsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AppSettingsService — Anwendungskonfiguration")
class AppSettingsServiceTest {

    @Mock
    private AppSettingRepository appSettingRepository;

    @InjectMocks
    private AppSettingsService appSettingsService;


    @Nested
    @DisplayName("getString")
    class GetStringTests {

        @Test
        @DisplayName("Vorhandener Schluessel gibt gespeicherten Wert zurueck")
        void getString_existingKey_returnsStoredValue() {
            AppSetting setting = AppSetting.builder().key("site.name").value("HalıSaha Wien").build();
            when(appSettingRepository.findById("site.name")).thenReturn(Optional.of(setting));

            String result = appSettingsService.getString("site.name", "Default");

            assertThat(result).isEqualTo("HalıSaha Wien");
        }

        @Test
        @DisplayName("Nicht vorhandener Schluessel gibt Standardwert zurueck")
        void getString_missingKey_returnsDefault() {
            when(appSettingRepository.findById("unknown.key")).thenReturn(Optional.empty());

            String result = appSettingsService.getString("unknown.key", "Fallback");

            assertThat(result).isEqualTo("Fallback");
        }

        @Test
        @DisplayName("Leerer Wert wird korrekt zurueckgegeben")
        void getString_emptyValue_returnsEmptyString() {
            AppSetting setting = AppSetting.builder().key("empty.key").value("").build();
            when(appSettingRepository.findById("empty.key")).thenReturn(Optional.of(setting));

            String result = appSettingsService.getString("empty.key", "default");

            assertThat(result).isEmpty();
        }
    }


    @Nested
    @DisplayName("getInt")
    class GetIntTests {

        @Test
        @DisplayName("Vorhandener numerischer Schluessel gibt Integer zurueck")
        void getInt_existingKey_returnsParsedInt() {
            AppSetting setting = AppSetting.builder().key("slot.hold.minutes").value("5").build();
            when(appSettingRepository.findById("slot.hold.minutes")).thenReturn(Optional.of(setting));

            int result = appSettingsService.getInt("slot.hold.minutes", 10);

            assertThat(result).isEqualTo(5);
        }

        @Test
        @DisplayName("Nicht vorhandener Schluessel gibt Standardwert zurueck")
        void getInt_missingKey_returnsDefault() {
            when(appSettingRepository.findById("missing.int")).thenReturn(Optional.empty());

            int result = appSettingsService.getInt("missing.int", 42);

            assertThat(result).isEqualTo(42);
        }

        @Test
        @DisplayName("Nicht-numerischer Wert wirft NumberFormatException")
        void getInt_nonNumericValue_throwsException() {
            AppSetting setting = AppSetting.builder().key("bad.int").value("abc").build();
            when(appSettingRepository.findById("bad.int")).thenReturn(Optional.of(setting));

            assertThatThrownBy(() -> appSettingsService.getInt("bad.int", 0))
                    .isInstanceOf(NumberFormatException.class);
        }

        @Test
        @DisplayName("Negativer Integer-Wert wird korrekt geparst")
        void getInt_negativeValue_parsesCorrectly() {
            AppSetting setting = AppSetting.builder().key("offset").value("-3").build();
            when(appSettingRepository.findById("offset")).thenReturn(Optional.of(setting));

            int result = appSettingsService.getInt("offset", 0);

            assertThat(result).isEqualTo(-3);
        }
    }
}
