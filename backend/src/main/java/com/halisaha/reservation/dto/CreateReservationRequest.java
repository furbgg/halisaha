package com.halisaha.reservation.dto;

import com.halisaha.payment.PaymentMethod;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReservationRequest {

    @NotNull(message = "Platz-ID darf nicht leer sein")
    private Long fieldId;

    @NotNull(message = "Sportart (Game Type) darf nicht leer sein")
    private String gameType;

    @NotNull(message = "Startzeit darf nicht leer sein")
    private ZonedDateTime startTime;

    @NotNull(message = "Dauer darf nicht leer sein")
    @Min(value = 60, message = "Mindestdauer ist 60 Minuten")
    @Max(value = 180, message = "Maximaldauer ist 180 Minuten")
    private Integer durationMinutes;

    @Size(max = 100, message = "Gastname darf max. 100 Zeichen lang sein")
    private String guestName;

    @Size(max = 20, message = "Telefonnummer darf max. 20 Zeichen lang sein")
    private String guestPhone;

    @Email(message = "Ungültige E-Mail-Adresse")
    private String guestEmail;

    @NotNull(message = "Datenschutzerklärung muss akzeptiert werden")
    private Boolean privacyAccepted;

    private Boolean notificationConsent;

    private PaymentMethod paymentMethod;

    private List<EquipmentRentalItem> equipmentRentals = new ArrayList<>();

    private String sessionId;

    private String couponCode;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentRentalItem {
        private Long equipmentId;
        private Integer quantity;
        private String size;
    }
}
