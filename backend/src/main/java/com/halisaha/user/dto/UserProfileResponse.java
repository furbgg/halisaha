package com.halisaha.user.dto;

import com.halisaha.user.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private String displayId;
    private String name;
    private String email;
    private String phone;
    private UserRole role;
    private boolean totpEnabled;
    private ZonedDateTime createdAt;
}
