package com.halisaha.contact;

import com.halisaha.common.dto.ApiResponse;
import com.halisaha.contact.dto.ContactResponse;
import com.halisaha.contact.entity.ContactMessage.Status;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/contact")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminContactController {

    private final ContactService contactService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ContactResponse>>> getAll(
            @RequestParam(required = false) Status status) {
        List<ContactResponse> messages = (status != null)
                ? contactService.getByStatus(status)
                : contactService.getAll();
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countNew() {
        return ResponseEntity.ok(ApiResponse.success(contactService.countNew()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactResponse>> getById(@PathVariable Long id) {
        contactService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(contactService.getById(id)));
    }

    @PatchMapping("/{id}/replied")
    public ResponseEntity<ApiResponse<ContactResponse>> markReplied(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Als beantwortet markiert", contactService.markAsReplied(id)));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<ContactResponse>> archive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Nachricht archiviert", contactService.archive(id)));
    }

    @PatchMapping("/{id}/notes")
    public ResponseEntity<ApiResponse<ContactResponse>> updateNotes(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        String notes = body.getOrDefault("notes", "");
        return ResponseEntity.ok(ApiResponse.success(contactService.updateNotes(id, notes)));
    }
}
