package com.halisaha.admin;

import com.halisaha.admin.dto.DailyReportResponse;
import com.halisaha.admin.dto.MonthlyReportResponse;
import com.halisaha.admin.dto.PeakHoursResponse;
import com.halisaha.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminReportController — Rapor Endpointleri")
class AdminReportControllerTest {

    @Mock
    private ReportService reportService;

    @InjectMocks
    private AdminReportController adminReportController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminReportController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }


    @Nested
    @DisplayName("GET /admin/reports/daily")
    class DailyReportTests {

        @Test
        @DisplayName("Gecerli tarih — 200 ve rapor doner")
        void getDailyReport_validDate_returns200() throws Exception {
            DailyReportResponse response = DailyReportResponse.builder()
                    .date("2026-03-15")
                    .totalReservations(10)
                    .totalRevenue(new BigDecimal("800.00"))
                    .hourlyBreakdown(new LinkedHashMap<>())
                    .fieldBreakdown(Collections.emptyList())
                    .build();
            when(reportService.getDailyReport(LocalDate.of(2026, 3, 15))).thenReturn(response);

            mockMvc.perform(get("/admin/reports/daily")
                    .param("date", "2026-03-15"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.date").value("2026-03-15"))
                    .andExpect(jsonPath("$.data.totalReservations").value(10));
        }

        @Test
        @DisplayName("Gecersiz tarih formati — 400")
        void getDailyReport_invalidDate_returns400() throws Exception {
            mockMvc.perform(get("/admin/reports/daily")
                    .param("date", "invalid-date"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Tarih parametresi eksik — 400")
        void getDailyReport_missingDate_returns400() throws Exception {
            mockMvc.perform(get("/admin/reports/daily"))
                    .andExpect(status().isBadRequest());
        }
    }


    @Nested
    @DisplayName("GET /admin/reports/monthly")
    class MonthlyReportTests {

        @Test
        @DisplayName("Gecerli ay — 200 ve rapor doner")
        void getMonthlyReport_validMonth_returns200() throws Exception {
            MonthlyReportResponse response = MonthlyReportResponse.builder()
                    .month("2026-03")
                    .totalReservations(100)
                    .totalRevenue(new BigDecimal("8000.00"))
                    .comparison(MonthlyReportResponse.ComparisonToPreviousMonth.builder()
                            .revenueChange(new BigDecimal("500.00"))
                            .revenueChangePercent(6.67)
                            .reservationChange(10)
                            .build())
                    .build();
            when(reportService.getMonthlyReport(YearMonth.of(2026, 3))).thenReturn(response);

            mockMvc.perform(get("/admin/reports/monthly")
                    .param("month", "2026-03"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.month").value("2026-03"))
                    .andExpect(jsonPath("$.data.totalReservations").value(100));
        }

        @Test
        @DisplayName("Gecersiz ay formati — 500 (DateTimeParseException)")
        void getMonthlyReport_invalidMonth_returns500() throws Exception {
            mockMvc.perform(get("/admin/reports/monthly")
                    .param("month", "invalid"))
                    .andExpect(status().isInternalServerError());
        }
    }


    @Nested
    @DisplayName("GET /admin/reports/peak-hours")
    class PeakHoursTests {

        @Test
        @DisplayName("Gecerli ay — 200 ve peak hours doner")
        void getPeakHours_validMonth_returns200() throws Exception {
            PeakHoursResponse response = PeakHoursResponse.builder()
                    .month("2026-03")
                    .hourlyOccupancy(Map.of(18, 85.0, 19, 72.0))
                    .peakHours(List.of(18, 19))
                    .quietHours(List.of(9, 10, 11))
                    .recommendation("Sessiz saatler icin indirim onerilir")
                    .build();
            when(reportService.getPeakHours(YearMonth.of(2026, 3))).thenReturn(response);

            mockMvc.perform(get("/admin/reports/peak-hours")
                    .param("month", "2026-03"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.month").value("2026-03"))
                    .andExpect(jsonPath("$.data.peakHours").isArray())
                    .andExpect(jsonPath("$.data.quietHours").isArray());
        }

        @Test
        @DisplayName("Service exception — 500")
        void getPeakHours_serviceError_returns500() throws Exception {
            when(reportService.getPeakHours(any())).thenThrow(new RuntimeException("DB error"));

            mockMvc.perform(get("/admin/reports/peak-hours")
                            .param("month", "2026-03"))
                    .andExpect(status().isInternalServerError());
        }
    }
}
