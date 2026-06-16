package com.halisaha.config;

import com.halisaha.user.UserRole;
import com.halisaha.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class AdminAccountValidator {

    private final Environment environment;
    private final UserRepository userRepository;

    @PostConstruct
    public void validate() {
        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        if (!isProd) {
            return;
        }

        boolean hasActiveAdmin = userRepository.existsByRoleAndActiveTrue(UserRole.ADMIN);
        if (!hasActiveAdmin) {
            throw new IllegalStateException(
                    "No active ADMIN user found in production. " +
                    "Run ./ops/provision-admin.sh before starting the backend.");
        }
    }
}
