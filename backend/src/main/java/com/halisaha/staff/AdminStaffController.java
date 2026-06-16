package com.halisaha.staff;

import com.halisaha.common.dto.ApiResponse;
import com.halisaha.staff.entity.Staff;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/staff")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminStaffController {

    private final StaffService staffService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Staff>>> getAll() {
        List<Staff> staff = staffService.getAll();
        return ResponseEntity.ok(ApiResponse.success(staff));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Staff>> getById(@PathVariable Long id) {
        Staff staff = staffService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(staff));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Staff>> create(@RequestBody Staff staff) {
        Staff created = staffService.create(staff);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Mitarbeiter erstellt", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Staff>> update(@PathVariable Long id, @RequestBody Staff staff) {
        Staff updated = staffService.update(id, staff);
        return ResponseEntity.ok(ApiResponse.success("Mitarbeiter aktualisiert", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        staffService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Mitarbeiter deaktiviert", null));
    }
}
