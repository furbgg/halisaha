package com.halisaha.field;

import com.halisaha.common.dto.ApiResponse;
import com.halisaha.field.dto.FieldAvailabilityResponse;
import com.halisaha.field.entity.Field;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class FieldController {

    private final FieldService fieldService;


    @GetMapping("/fields")
    public ResponseEntity<ApiResponse<List<Field>>> getAllFields() {
        List<Field> fields = fieldService.getAllActiveFields();
        return ResponseEntity.ok(ApiResponse.success(fields));
    }

    @GetMapping("/fields/{id}")
    public ResponseEntity<ApiResponse<Field>> getField(@PathVariable Long id) {
        Field field = fieldService.getFieldById(id);
        return ResponseEntity.ok(ApiResponse.success(field));
    }

    @GetMapping("/fields/{id}/availability")
    public ResponseEntity<ApiResponse<FieldAvailabilityResponse>> getAvailability(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "1") int duration) {
        FieldAvailabilityResponse availability = fieldService.getAvailability(id, date, duration);
        return ResponseEntity.ok(ApiResponse.success(availability));
    }


    @PostMapping("/admin/fields")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Field>> createField(@RequestBody Field field) {
        Field created = fieldService.createField(field);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Platz erstellt", created));
    }

    @PutMapping("/admin/fields/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Field>> updateField(@PathVariable Long id, @RequestBody Field field) {
        Field updated = fieldService.updateField(id, field);
        return ResponseEntity.ok(ApiResponse.success("Platz aktualisiert", updated));
    }

    @DeleteMapping("/admin/fields/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteField(@PathVariable Long id) {
        fieldService.deleteField(id);
        return ResponseEntity.ok(ApiResponse.success("Platz deaktiviert", null));
    }
}
