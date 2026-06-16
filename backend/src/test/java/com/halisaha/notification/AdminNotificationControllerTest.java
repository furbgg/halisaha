package com.halisaha.notification;

import com.halisaha.common.exception.GlobalExceptionHandler;
import com.halisaha.notification.entity.Notification;
import com.halisaha.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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
@DisplayName("AdminNotificationController — Benachrichtigungsverwaltung")
class AdminNotificationControllerTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private AdminNotificationController adminNotificationController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminNotificationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Nested
    @DisplayName("GET /admin/notifications")
    class GetAllTests {

        @Test
        @DisplayName("Benachrichtigungen paginiert abrufen gibt 200 zurueck")
        void getAll_returns200WithPagination() throws Exception {
            Notification n1 = Notification.builder().id(1L).build();
            Page<Notification> page = new PageImpl<>(List.of(n1), PageRequest.of(0, 20), 1);
            when(notificationRepository.findAll(any(PageRequest.class))).thenReturn(page);

            mockMvc.perform(get("/admin/notifications")
                    .param("page", "0")
                    .param("size", "20"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content").isArray());
        }

        @Test
        @DisplayName("Standard-Pagination ohne Parameter")
        void getAll_defaultPagination_returns200() throws Exception {
            Page<Notification> emptyPage = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
            when(notificationRepository.findAll(any(PageRequest.class))).thenReturn(emptyPage);

            mockMvc.perform(get("/admin/notifications"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalElements").value(0));
        }
    }

    @Nested
    @DisplayName("GET /admin/notifications/stats")
    class GetStatsTests {

        @Test
        @DisplayName("Statistiken abrufen gibt 200 mit Zaehler zurueck")
        void getStats_returns200WithCounts() throws Exception {
            when(notificationRepository.count()).thenReturn(100L);
            when(notificationRepository.countByStatus(NotificationStatus.SENT)).thenReturn(85L);
            when(notificationRepository.countByStatus(NotificationStatus.FAILED)).thenReturn(5L);
            when(notificationRepository.countByStatus(NotificationStatus.PENDING)).thenReturn(10L);

            mockMvc.perform(get("/admin/notifications/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.total").value(100))
                    .andExpect(jsonPath("$.data.sent").value(85))
                    .andExpect(jsonPath("$.data.failed").value(5))
                    .andExpect(jsonPath("$.data.pending").value(10));
        }

        @Test
        @DisplayName("Leere Tabelle gibt 0 fuer alle Zaehler")
        void getStats_emptyTable_allZeros() throws Exception {
            when(notificationRepository.count()).thenReturn(0L);
            when(notificationRepository.countByStatus(NotificationStatus.SENT)).thenReturn(0L);
            when(notificationRepository.countByStatus(NotificationStatus.FAILED)).thenReturn(0L);
            when(notificationRepository.countByStatus(NotificationStatus.PENDING)).thenReturn(0L);

            mockMvc.perform(get("/admin/notifications/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.total").value(0))
                    .andExpect(jsonPath("$.data.sent").value(0));
        }

        @Test
        @DisplayName("Repository-Fehler gibt 500 zurueck")
        void getStats_repositoryError_returns500() throws Exception {
            when(notificationRepository.count()).thenThrow(new RuntimeException("DB error"));

            mockMvc.perform(get("/admin/notifications/stats"))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("GET /admin/notifications — Detaillierte Tests")
    class GetAllDetailedTests {

        @Test
        @DisplayName("Notification-Felder korrekt in Response")
        void getAll_returnsCorrectNotificationFields() throws Exception {
            Notification n = Notification.builder()
                    .id(1L)
                    .recipient("test@example.com")
                    .status(NotificationStatus.SENT)
                    .build();
            Page<Notification> page = new PageImpl<>(List.of(n), PageRequest.of(0, 20), 1);
            when(notificationRepository.findAll(any(PageRequest.class))).thenReturn(page);

            mockMvc.perform(get("/admin/notifications"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.content[0].recipient").value("test@example.com"))
                    .andExpect(jsonPath("$.data.content[0].status").value("SENT"));
        }
    }
}
