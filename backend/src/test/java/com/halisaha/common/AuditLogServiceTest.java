package com.halisaha.common;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.halisaha.common.entity.AuditLog;
import com.halisaha.common.repository.AuditLogRepository;
import com.halisaha.common.service.AuditLogService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuditLogService — Admin-Aktionsprotokollierung")
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AuditLogService auditLogService;


    @Nested
    @DisplayName("Aktion protokollieren")
    class LogActionTests {

        @Test
        @DisplayName("Aktion wird mit korrekten Feldern gespeichert")
        void logAction_savesWithCorrectFields() throws JsonProcessingException {
            when(objectMapper.writeValueAsString(any())).thenReturn("{\"key\":\"value\"}");
            when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

            auditLogService.logAction(
                    1L, "UPDATE", "EQUIPMENT", 42L,
                    Map.of("name", "OldName"), Map.of("name", "NewName"),
                    "192.168.1.100"
            );

            ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
            verify(auditLogRepository).save(captor.capture());

            AuditLog saved = captor.getValue();
            assertThat(saved.getUserId()).isEqualTo(1L);
            assertThat(saved.getAction()).isEqualTo("UPDATE");
            assertThat(saved.getEntityType()).isEqualTo("EQUIPMENT");
            assertThat(saved.getEntityId()).isEqualTo(42L);
            assertThat(saved.getIpAddress()).isEqualTo("192.168.1.100");
            assertThat(saved.getOldValue()).isEqualTo("{\"key\":\"value\"}");
            assertThat(saved.getNewValue()).isEqualTo("{\"key\":\"value\"}");
        }

        @Test
        @DisplayName("Null-Werte ergeben null in old/newValue")
        void logAction_nullValues_storesNull() {
            when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

            auditLogService.logAction(
                    2L, "DELETE", "STAFF", 10L,
                    null, null, "10.0.0.1"
            );

            ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
            verify(auditLogRepository).save(captor.capture());

            AuditLog saved = captor.getValue();
            assertThat(saved.getOldValue()).isNull();
            assertThat(saved.getNewValue()).isNull();
        }

        @Test
        @DisplayName("JSON-Serialisierungsfehler verwendet toString-Fallback")
        void logAction_jsonSerializationError_usesToString() throws JsonProcessingException {
            Map<String, String> testValue = Map.of("field", "value");
            when(objectMapper.writeValueAsString(testValue))
                    .thenThrow(new JsonProcessingException("Serialization failed") {
                    });
            when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

            auditLogService.logAction(
                    3L, "CREATE", "RESERVATION", 77L,
                    testValue, null, "127.0.0.1");

            ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
            verify(auditLogRepository).save(captor.capture());

            AuditLog saved = captor.getValue();
            assertThat(saved.getOldValue()).isNotNull();
            assertThat(saved.getOldValue()).contains("field");
        }

        @Test
        @DisplayName("Verschiedene Aktionstypen werden akzeptiert")
        void logAction_variousActionTypes() {
            when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

            auditLogService.logAction(1L, "CREATE", "FIELD", 1L, null, null, "::1");
            auditLogService.logAction(1L, "UPDATE", "FIELD", 1L, null, null, "::1");
            auditLogService.logAction(1L, "DELETE", "FIELD", 1L, null, null, "::1");

            verify(auditLogRepository, times(3)).save(any(AuditLog.class));
        }

        @Test
        @DisplayName("Leere String-Werte werden gespeichert")
        void logAction_emptyStrings_areSaved() {
            when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

            auditLogService.logAction(1L, "", "", 1L, null, null, "");

            ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
            verify(auditLogRepository).save(captor.capture());

            AuditLog saved = captor.getValue();
            assertThat(saved.getAction()).isEmpty();
            assertThat(saved.getEntityType()).isEmpty();
            assertThat(saved.getIpAddress()).isEmpty();
        }

        @Test
        @DisplayName("Komplexe verschachtelte Objekte werden serialisiert")
        void logAction_nestedObjects_serialized() throws JsonProcessingException {
            Map<String, Object> nested = Map.of("field", Map.of("name", "Platz 1", "active", true));
            when(objectMapper.writeValueAsString(nested)).thenReturn("{\"field\":{\"name\":\"Platz 1\"}}");
            when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

            auditLogService.logAction(1L, "UPDATE", "FIELD", 1L, nested, null, "127.0.0.1");

            ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
            verify(auditLogRepository).save(captor.capture());
            assertThat(captor.getValue().getOldValue()).contains("Platz 1");
        }

        @Test
        @DisplayName("Repository save wird immer aufgerufen auch bei leeren Werten")
        void logAction_alwaysSaves() {
            when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(inv -> inv.getArgument(0));

            auditLogService.logAction(null, "TEST", "TEST", null, null, null, null);

            verify(auditLogRepository).save(any(AuditLog.class));
        }
    }
}
