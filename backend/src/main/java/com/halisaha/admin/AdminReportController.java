package com.halisaha.admin;

import com.halisaha.admin.dto.DailyReportResponse;
import com.halisaha.admin.dto.MonthlyReportResponse;
import com.halisaha.admin.dto.PeakHoursResponse;
import com.halisaha.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.YearMonth;

@RestController
@RequestMapping("/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<DailyReportResponse>> getDailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DailyReportResponse report = reportService.getDailyReport(date);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<MonthlyReportResponse>> getMonthlyReport(
            @RequestParam String month) {
        YearMonth ym = YearMonth.parse(month);
        MonthlyReportResponse report = reportService.getMonthlyReport(ym);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<ApiResponse<PeakHoursResponse>> getPeakHours(
            @RequestParam String month) {
        YearMonth ym = YearMonth.parse(month);
        PeakHoursResponse report = reportService.getPeakHours(ym);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
