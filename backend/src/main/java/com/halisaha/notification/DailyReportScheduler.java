package com.halisaha.notification;

import com.halisaha.common.AppConstants;
import com.halisaha.common.service.AppSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DailyReportScheduler {

    private final DailyReportService dailyReportService;
    private final AppSettingsService appSettingsService;

    @Scheduled(cron = "0 0 * * * *")
    public void checkAndSendDailyReport() {
        if (!appSettingsService.getBoolean("admin_daily_report", true)) {
            return;
        }

        int reportHour = appSettingsService.getInt("admin_daily_report_hour", 23);
        int currentHour = ZonedDateTime.now(AppConstants.VIENNA).getHour();

        if (currentHour != reportHour) {
            return;
        }

        log.info("Generating daily report for today");
        try {
            dailyReportService.generateAndSendReport(LocalDate.now(AppConstants.VIENNA));
        } catch (Exception e) {
            log.error("Failed to generate daily report", e);
        }
    }
}
