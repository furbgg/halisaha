package com.halisaha.contact;

import com.halisaha.common.dto.ApiResponse;
import com.halisaha.contact.dto.ContactRequest;
import com.halisaha.contact.dto.ContactResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponse>> submit(
            @Valid @RequestBody ContactRequest request) {
        ContactResponse response = contactService.submit(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Ihre Nachricht wurde erfolgreich gesendet. Wir melden uns bald bei Ihnen.", response));
    }
}
