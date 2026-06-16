package com.halisaha.common;

import com.halisaha.common.dto.ApiResponse;
import com.halisaha.common.service.AppSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Public endpoint for settings that the frontend needs to access
 * without authentication (e.g., Happy Hour banner on dashboard).
 */
@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class PublicSettingsController {

    private final AppSettingsService appSettingsService;

    @GetMapping("/happy-hour")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHappyHourConfig() {
        Map<String, Object> config = appSettingsService.getHappyHourConfig();
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    @GetMapping("/hold-duration")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHoldDuration() {
        int minutes = appSettingsService.getInt("hold_duration_minutes", 5);
        return ResponseEntity.ok(ApiResponse.success(Map.of("holdDurationMinutes", minutes)));
    }

    @GetMapping("/prices")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPrices() {
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "FOOTBALL", appSettingsService.getSportPrice("FOOTBALL"),
            "BUBBLE_SOCCER", appSettingsService.getSportPrice("BUBBLE_SOCCER"),
            "TENNIS", appSettingsService.getSportPrice("TENNIS"),
            "BASKETBALL", appSettingsService.getSportPrice("BASKETBALL"),
            "VOLLEYBALL", appSettingsService.getSportPrice("VOLLEYBALL")
        )));
    }
}
