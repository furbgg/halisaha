package com.halisaha.admin;

import com.halisaha.auth.AuthService;
import com.halisaha.auth.PasswordResetService;
import com.halisaha.auth.dto.InviteAdminRequest;
import com.halisaha.common.dto.ApiResponse;
import com.halisaha.notification.EmailService;
import com.halisaha.user.UserRole;
import com.halisaha.user.entity.User;
import com.halisaha.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;
    private final AuthService authService;

    @PostMapping("/invite-admin")
    public ResponseEntity<ApiResponse<Void>> inviteAdmin(
            @Valid @RequestBody InviteAdminRequest request) {

        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Diese E-Mail-Adresse ist bereits registriert."));
        }

        String temporaryPassword = passwordResetService.generateSecurePassword();

        String displayId = authService.generateNewDisplayId();

        User admin = User.builder()
                .displayId(displayId)
                .name(request.getName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(temporaryPassword))
                .role(UserRole.ADMIN)
                .active(true)
                .build();

        userRepository.save(admin);
        log.info("New admin user created: {}", admin.getDisplayId());

        emailService.sendAdminInvite(email, request.getName().trim(), temporaryPassword);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Admin-Benutzer erstellt. Zugangsdaten wurden per E-Mail gesendet.", null));
    }
}
