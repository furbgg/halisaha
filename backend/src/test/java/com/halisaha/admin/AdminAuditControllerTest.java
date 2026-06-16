package com.halisaha.admin;

import com.halisaha.common.entity.AuditLog;
import com.halisaha.common.exception.GlobalExceptionHandler;
import com.halisaha.common.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminAuditController — Audit-Log-Endpunkt")
class AdminAuditControllerTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AdminAuditController adminAuditController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminAuditController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /admin/audit-logs gibt paginierte Audit-Logs zurueck")
    void getAll_returns200WithPaginatedLogs() throws Exception {
        AuditLog log1 = AuditLog.builder().id(1L).action("CREATE").entityType("EQUIPMENT").build();
        AuditLog log2 = AuditLog.builder().id(2L).action("DELETE").entityType("STAFF").build();
        Page<AuditLog> page = new PageImpl<>(List.of(log1, log2), PageRequest.of(0, 20), 2);
        when(auditLogRepository.findAll(any(PageRequest.class))).thenReturn(page);

        mockMvc.perform(get("/admin/audit-logs")
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @Test
    @DisplayName("Standard-Pagination ohne Parameter gibt 200 zurueck")
    void getAll_defaultParams_returns200() throws Exception {
        Page<AuditLog> emptyPage = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
        when(auditLogRepository.findAll(any(PageRequest.class))).thenReturn(emptyPage);

        mockMvc.perform(get("/admin/audit-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    @DisplayName("Benutzerdefinierte Pagination wird korrekt weitergeleitet")
    void getAll_customPagination_returns200() throws Exception {
        Page<AuditLog> page = new PageImpl<>(List.of(), PageRequest.of(2, 5), 100);
        when(auditLogRepository.findAll(any(PageRequest.class))).thenReturn(page);

        mockMvc.perform(get("/admin/audit-logs")
                .param("page", "2")
                .param("size", "5"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Audit-Log-Eintraege enthalten korrekte Felder")
    void getAll_returnsCorrectFields() throws Exception {
        AuditLog log = AuditLog.builder()
                .id(1L).action("CREATE").entityType("RESERVATION")
                .entityId(42L).userId(5L).ipAddress("192.168.1.1")
                .build();
        Page<AuditLog> page = new PageImpl<>(List.of(log), PageRequest.of(0, 20), 1);
        when(auditLogRepository.findAll(any(PageRequest.class))).thenReturn(page);

        mockMvc.perform(get("/admin/audit-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].action").value("CREATE"))
                .andExpect(jsonPath("$.data.content[0].entityType").value("RESERVATION"))
                .andExpect(jsonPath("$.data.content[0].entityId").value(42));
    }

    @Test
    @DisplayName("Grosse Pagination wird akzeptiert")
    void getAll_largePage_returns200() throws Exception {
        Page<AuditLog> page = new PageImpl<>(List.of(), PageRequest.of(100, 50), 0);
        when(auditLogRepository.findAll(any(PageRequest.class))).thenReturn(page);

        mockMvc.perform(get("/admin/audit-logs")
                .param("page", "100")
                .param("size", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    @DisplayName("Repository-Fehler gibt 500 zurueck")
    void getAll_repositoryError_returns500() throws Exception {
        when(auditLogRepository.findAll(any(PageRequest.class)))
                .thenThrow(new RuntimeException("DB error"));

        mockMvc.perform(get("/admin/audit-logs"))
                .andExpect(status().isInternalServerError());
    }
}
