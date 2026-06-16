package com.halisaha.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ContactRequest {

    @NotBlank(message = "Name ist erforderlich")
    @Size(max = 100, message = "Name darf maximal 100 Zeichen lang sein")
    private String name;

    @NotBlank(message = "E-Mail ist erforderlich")
    @Email(message = "Ungültige E-Mail-Adresse")
    private String email;

    @Size(max = 20, message = "Telefonnummer darf maximal 20 Zeichen lang sein")
    private String phone;

    @Size(max = 200, message = "Betreff darf maximal 200 Zeichen lang sein")
    private String subject;

    @NotBlank(message = "Nachricht ist erforderlich")
    @Size(max = 5000, message = "Nachricht darf maximal 5000 Zeichen lang sein")
    private String message;
}
