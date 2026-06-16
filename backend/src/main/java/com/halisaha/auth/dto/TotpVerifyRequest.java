package com.halisaha.auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TotpVerifyRequest {

    @NotNull(message = "TOTP-Code darf nicht leer sein")
    private Integer code;
}
