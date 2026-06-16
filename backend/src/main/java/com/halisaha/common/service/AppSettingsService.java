package com.halisaha.common.service;

import com.halisaha.common.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AppSettingsService {

    private final AppSettingRepository appSettingRepository;

    @Value("${app.admin-email:}")
    private String adminEmailEnv;

    public String getString(String key, String defaultValue) {
        return appSettingRepository.findById(key)
                .map(s -> s.getValue())
                .orElse(defaultValue);
    }

    public int getInt(String key, int defaultValue) {
        return appSettingRepository.findById(key)
                .map(s -> Integer.parseInt(s.getValue()))
                .orElse(defaultValue);
    }

    public BigDecimal getBigDecimal(String key, BigDecimal defaultValue) {
        return appSettingRepository.findById(key)
                .map(s -> new BigDecimal(s.getValue()))
                .orElse(defaultValue);
    }

    public boolean getBoolean(String key, boolean defaultValue) {
        return appSettingRepository.findById(key)
                .map(s -> Boolean.parseBoolean(s.getValue()))
                .orElse(defaultValue);
    }

    /**
     * Returns Happy Hour configuration as a map.
     */
    public Map<String, Object> getHappyHourConfig() {
        boolean enabled = getBoolean("happy_hour_enabled", false);
        String start = getString("happy_hour_start", "10:00");
        String end = getString("happy_hour_end", "14:00");
        int discount = getInt("happy_hour_discount", 15);

        return Map.of(
                "enabled", enabled,
                "startTime", start,
                "endTime", end,
                "discountPercent", discount);
    }

    /**
     * Checks if Happy Hour is active and the given slot time falls within the
     * window.
     */
    public boolean isHappyHourActiveForSlot(LocalTime slotTime) {
        if (!getBoolean("happy_hour_enabled", false)) {
            return false;
        }
        LocalTime start = LocalTime.parse(getString("happy_hour_start", "10:00"));
        LocalTime end = LocalTime.parse(getString("happy_hour_end", "14:00"));

        if (!start.isAfter(end)) {
            return !slotTime.isBefore(start) && slotTime.isBefore(end);
        }
        return !slotTime.isBefore(start) || slotTime.isBefore(end);
    }

    public int getHappyHourDiscount() {
        return getInt("happy_hour_discount", 15);
    }

    /**
     * Get the dynamic hourly price based on the sport type.
     */
    public BigDecimal getSportPrice(String gameType) {
        if ("BUBBLE_SOCCER".equalsIgnoreCase(gameType) || "BUBBLE".equalsIgnoreCase(gameType)) {
            return getBigDecimal("price_bubble_soccer", new BigDecimal("160.00"));
        } else if ("TENNIS".equalsIgnoreCase(gameType)) {
            return getBigDecimal("price_tennis", new BigDecimal("60.00"));
        } else if ("BASKETBALL".equalsIgnoreCase(gameType)) {
            return getBigDecimal("price_basketball", new BigDecimal("50.00"));
        } else if ("VOLLEYBALL".equalsIgnoreCase(gameType)) {
            return getBigDecimal("price_volleyball", new BigDecimal("50.00"));
        }
        
        return getBigDecimal("price_football", new BigDecimal("80.00"));
    }

    public String getAdminEmail() {
        String dbEmail = getString("admin_email", "");
        return (dbEmail != null && !dbEmail.isBlank()) ? dbEmail : adminEmailEnv;
    }
}
