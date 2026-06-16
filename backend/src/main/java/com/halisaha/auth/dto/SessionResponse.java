package com.halisaha.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private String deviceInfo;
    private String ipAddress;
    private String createdAt;
    private String lastUsedAt;
    private boolean current;
}
