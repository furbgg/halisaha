package com.halisaha.admin;

import com.halisaha.common.dto.ApiResponse;
import com.halisaha.common.entity.AppSetting;
import com.halisaha.common.repository.AppSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/settings")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final AppSettingRepository appSettingRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppSetting>>> getAll() {
        List<AppSetting> settings = appSettingRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }

    @PutMapping("/{key}")
    public ResponseEntity<ApiResponse<AppSetting>> update(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        AppSetting setting = appSettingRepository.findById(key)
                .orElse(AppSetting.builder().key(key).build());
        setting.setValue(body.get("value"));
        AppSetting saved = appSettingRepository.save(setting);
        return ResponseEntity.ok(ApiResponse.success("Einstellung aktualisiert", saved));
    }
}
