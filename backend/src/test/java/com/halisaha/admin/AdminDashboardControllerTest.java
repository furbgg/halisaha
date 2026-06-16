package com.halisaha.admin;

import com.halisaha.admin.dto.DashboardResponse;
import com.halisaha.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminDashboardController — Dashboard-Endpunkt")
class AdminDashboardControllerTest {

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private AdminDashboardController adminDashboardController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminDashboardController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /admin/dashboard gibt 200 mit Dashboard-Daten zurueck")
    void getDashboard_returns200WithData() throws Exception {
        DashboardResponse response = DashboardResponse.builder()
                .todayReservations(8L)
                .todayRevenue(new BigDecimal("800.00"))
                .weekReservations(45L)
                .weekRevenue(new BigDecimal("3600.00"))
                .monthReservations(150L)
                .monthRevenue(new BigDecimal("12500.00"))
                .build();
        when(dashboardService.getDashboard()).thenReturn(response);

        mockMvc.perform(get("/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.todayReservations").value(8))
                .andExpect(jsonPath("$.data.todayRevenue").value(800.00))
                .andExpect(jsonPath("$.data.monthReservations").value(150))
                .andExpect(jsonPath("$.data.monthRevenue").value(12500.00));
    }

    @Test
    @DisplayName("Dashboard-Service wird genau einmal aufgerufen")
    void getDashboard_callsServiceOnce() throws Exception {
        DashboardResponse response = DashboardResponse.builder().build();
        when(dashboardService.getDashboard()).thenReturn(response);

        mockMvc.perform(get("/admin/dashboard"))
                .andExpect(status().isOk());

        verify(dashboardService, times(1)).getDashboard();
    }

    @Test
    @DisplayName("Service-Fehler gibt 500 zurueck")
    void getDashboard_serviceError_returns500() throws Exception {
        when(dashboardService.getDashboard()).thenThrow(new RuntimeException("DB connection failed"));

        mockMvc.perform(get("/admin/dashboard"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Leere Dashboard-Daten gibt 200 zurueck")
    void getDashboard_emptyData_returns200() throws Exception {
        DashboardResponse response = DashboardResponse.builder()
                .todayReservations(0L)
                .todayRevenue(BigDecimal.ZERO)
                .weekReservations(0L)
                .weekRevenue(BigDecimal.ZERO)
                .monthReservations(0L)
                .monthRevenue(BigDecimal.ZERO)
                .build();
        when(dashboardService.getDashboard()).thenReturn(response);

        mockMvc.perform(get("/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.todayReservations").value(0))
                .andExpect(jsonPath("$.data.todayRevenue").value(0));
    }

    @Test
    @DisplayName("Erfolgsantwort enthaelt success=true")
    void getDashboard_success_hasCorrectResponseStructure() throws Exception {
        DashboardResponse response = DashboardResponse.builder()
                .todayReservations(5L)
                .build();
        when(dashboardService.getDashboard()).thenReturn(response);

        mockMvc.perform(get("/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists());
    }
}
