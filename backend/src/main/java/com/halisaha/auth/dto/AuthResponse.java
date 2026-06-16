package com.halisaha.auth.dto;

import com.halisaha.user.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String displayId;
    private String name;
    private String email;
    private UserRole role;
    private boolean totpRequired;
}
