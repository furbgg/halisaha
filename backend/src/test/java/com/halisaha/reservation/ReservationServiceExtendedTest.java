package com.halisaha.reservation;

import com.halisaha.common.AppConstants;

import com.halisaha.common.exception.InvalidReservationException;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.common.exception.SlotAlreadyBookedException;
import com.halisaha.equipment.EquipmentService;
import com.halisaha.equipment.entity.Equipment;
import com.halisaha.equipment.repository.EquipmentRentalRepository;
import com.halisaha.equipment.repository.EquipmentRepository;
import com.halisaha.field.entity.Field;
import com.halisaha.field.repository.FieldRepository;
import com.halisaha.notification.AdminAlertService;
import com.halisaha.notification.EmailService;
import com.halisaha.reservation.dto.CreateReservationRequest;
import com.halisaha.reservation.dto.ReservationResponse;
import com.halisaha.reservation.entity.Reservation;
import com.halisaha.reservation.repository.ReservationRepository;
import com.halisaha.reservation.repository.SlotHoldRepository;
import com.halisaha.user.entity.User;
import com.halisaha.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReservationService — Cancel, Guest, Equipment Rental, Admin Flows")
class ReservationServiceExtendedTest {

    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private FieldRepository fieldRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EquipmentRepository equipmentRepository;
    @Mock
    private EquipmentRentalRepository equipmentRentalRepository;
    @Mock
    private SlotHoldRepository slotHoldRepository;
    @Mock
    private EquipmentService equipmentService;
    @Mock
    private EmailService emailService;
    @Mock
    private com.halisaha.common.service.AppSettingsService appSettingsService;
    @Mock
    private AdminAlertService adminAlertService;
    @Mock
    private com.halisaha.payment.PaymentService paymentService;
    @Mock
    private com.halisaha.coupon.CouponService couponService;

    @InjectMocks
    private ReservationService reservationService;

    private Field testField;
    private User testUser;

    @BeforeEach
    void setUp() {
        testField = Field.builder()
                .id(1L)
                .name("Test Platz")
                .supportedSports(new String[]{"FOOTBALL"})
                .openingTime(LocalTime.of(9, 0))
                .closingTime(LocalTime.of(23, 0))
                .allowedDurations(new Integer[] { 60, 90, 120, 180 })
                .hourlyPrice(new BigDecimal("50.00"))
                .active(true)
                .build();

        testUser = User.builder()
                .id(10L)
                .name("Max Mustermann")
                .email("max@test.com")
                .build();
        lenient().when(appSettingsService.getString(eq("daily_guest_booking_limit"), anyString())).thenReturn("disabled");
        lenient().when(appSettingsService.getSportPrice("FOOTBALL")).thenReturn(new BigDecimal("50.00"));
        lenient().when(appSettingsService.isHappyHourActiveForSlot(any())).thenReturn(false);
    }

    private CreateReservationRequest createRequest(int hour, int minute, int durationMinutes) {
        CreateReservationRequest req = new CreateReservationRequest();
        req.setGameType("FOOTBALL");
        req.setFieldId(1L);
        req.setStartTime(ZonedDateTime.of(2026, 3, 20, hour, minute, 0, 0, AppConstants.VIENNA));
        req.setDurationMinutes(durationMinutes);
        req.setPrivacyAccepted(true);
        req.setGuestEmail("guest@test.de");
        return req;
    }

    private Reservation buildConfirmedReservation(int hour, int durationMin) {
        return Reservation.builder()
                .gameType("FOOTBALL")
                .id(200L)
                .confirmationCode("ABC123")
                .field(testField)
                .user(testUser)
                .startTime(ZonedDateTime.of(2026, 3, 20, hour, 0, 0, 0, AppConstants.VIENNA))
                .endTime(ZonedDateTime.of(2026, 3, 20, hour, 0, 0, 0, AppConstants.VIENNA).plusMinutes(durationMin))
                .durationMinutes(durationMin)
                .totalPrice(testField.getHourlyPrice()
                        .multiply(BigDecimal.valueOf(durationMin))
                        .divide(BigDecimal.valueOf(60), 2, java.math.RoundingMode.HALF_UP))
                .status(ReservationStatus.CONFIRMED)
                .build();
    }


    @Nested
    @DisplayName("Cancel Reservation")
    class CancelReservation {

        @Test
        @DisplayName("başarılı iptal — status CANCELLED olmalı")
        void cancelSuccess() {
            Reservation r = buildConfirmedReservation(18, 60);

            when(reservationRepository.findByConfirmationCode("ABC123"))
                    .thenReturn(Optional.of(r));
            when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));
            when(equipmentRentalRepository.findByReservationId(200L))
                    .thenReturn(Collections.emptyList());

            ReservationResponse response = reservationService.cancelReservation("ABC123", 10L, null, false);

            assertThat(response.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        }

        @Test
        @DisplayName("zaten iptal edilmiş → InvalidReservationException")
        void cancelAlreadyCancelled() {
            Reservation r = buildConfirmedReservation(18, 60);
            r.setStatus(ReservationStatus.CANCELLED);

            when(reservationRepository.findByConfirmationCode("ABC123"))
                    .thenReturn(Optional.of(r));

            assertThatThrownBy(() -> reservationService.cancelReservation("ABC123", 10L, null, false))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("bereits storniert");
        }

        @Test
        @DisplayName("olmayan rezervasyon kodu → ResourceNotFoundException")
        void cancelNotFound() {
            when(reservationRepository.findByConfirmationCode("NONE"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> reservationService.cancelReservation("NONE", null, null, false))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }


    @Nested
    @DisplayName("Admin Cancel")
    class AdminCancel {

        @Test
        @DisplayName("admin iptal — deadline kontrolü yok, cancelledBy=ADMIN")
        void adminCancelSuccess() {
            Reservation r = buildConfirmedReservation(14, 60);

            when(reservationRepository.findById(200L))
                    .thenReturn(Optional.of(r));
            when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));
            when(equipmentRentalRepository.findByReservationId(200L))
                    .thenReturn(Collections.emptyList());

            ReservationResponse response = reservationService.adminCancelReservation(200L);

            assertThat(response.getStatus()).isEqualTo(ReservationStatus.CANCELLED);
        }

        @Test
        @DisplayName("admin zaten iptal → exception")
        void adminCancelAlreadyCancelled() {
            Reservation r = buildConfirmedReservation(14, 60);
            r.setStatus(ReservationStatus.CANCELLED);

            when(reservationRepository.findById(200L))
                    .thenReturn(Optional.of(r));

            assertThatThrownBy(() -> reservationService.adminCancelReservation(200L))
                    .isInstanceOf(InvalidReservationException.class);
        }
    }


    @Nested
    @DisplayName("Admin Modify")
    class AdminModify {

        @Test
        @DisplayName("admin 60dk→120dk değişiklik — fiyat 100€")
        void adminModify60to120() {
            Reservation r = buildConfirmedReservation(14, 60);

            when(reservationRepository.findById(200L)).thenReturn(Optional.of(r));
            when(equipmentRentalRepository.findByReservationId(200L))
                    .thenReturn(Collections.emptyList());
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(new ArrayList<>(List.of(r)));
            when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            ReservationResponse response = reservationService.adminModifyReservation(
                    200L,
                    ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA),
                    120);

            assertThat(response.getDurationMinutes()).isEqualTo(120);
            assertThat(response.getTotalPrice()).isEqualByComparingTo(new BigDecimal("100.00"));
            assertThat(response.getEndTime())
                    .isEqualTo(ZonedDateTime.of(2026, 3, 20, 16, 0, 0, 0, AppConstants.VIENNA));
        }

        @Test
        @DisplayName("admin iptal edilmiş rezervasyonu değiştiremez")
        void adminModifyCancelledThrows() {
            Reservation r = buildConfirmedReservation(14, 60);
            r.setStatus(ReservationStatus.CANCELLED);

            when(reservationRepository.findById(200L)).thenReturn(Optional.of(r));

            assertThatThrownBy(() -> reservationService.adminModifyReservation(
                    200L, ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA), 90))
                    .isInstanceOf(InvalidReservationException.class);
        }

        @Test
        @DisplayName("admin çakışan zaman → SlotAlreadyBookedException")
        void adminModifyConflict() {
            Reservation r = buildConfirmedReservation(14, 60);
            Reservation other = Reservation.builder()
                    .gameType("FOOTBALL")
                    .id(300L)
                    .startTime(ZonedDateTime.of(2026, 3, 20, 15, 0, 0, 0, AppConstants.VIENNA))
                    .endTime(ZonedDateTime.of(2026, 3, 20, 16, 0, 0, 0, AppConstants.VIENNA))
                    .build();

            when(reservationRepository.findById(200L)).thenReturn(Optional.of(r));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(new ArrayList<>(List.of(r, other)));

            assertThatThrownBy(() -> reservationService.adminModifyReservation(
                    200L, ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA), 120))
                    .isInstanceOf(SlotAlreadyBookedException.class);
        }
    }


    @Nested
    @DisplayName("Guest Reservation")
    class GuestReservation {

        @Test
        @DisplayName("guest — isim zorunlu, isim yoksa exception")
        void guestNameRequired() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setGuestName(null);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());

            assertThatThrownBy(() -> reservationService.createReservation(req, null))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("Gastname");
        }

        @Test
        @DisplayName("guest — isim var, başarılı oluşturma")
        void guestWithNameSuccess() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setGuestName("Ali Yılmaz");
            req.setGuestPhone("+436501234567");
            req.setGuestEmail("ali@test.at");

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(reservationRepository.save(any())).thenAnswer(i -> {
                Reservation r = i.getArgument(0);
                r.setId(500L);
                return r;
            });

            ReservationResponse response = reservationService.createReservation(req, null);
            assertThat(response).isNotNull();
            assertThat(response.getCustomerName()).isEqualTo("Ali Yılmaz");
        }
    }


    @Nested
    @DisplayName("Privacy Validation")
    class PrivacyValidation {

        @Test
        @DisplayName("datenschutz kabul edilmemiş → exception")
        void privacyNotAccepted() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setPrivacyAccepted(false);

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("Datenschutz");
        }

        @Test
        @DisplayName("datenschutz null → exception")
        void privacyNull() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setPrivacyAccepted(null);

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class);
        }
    }


    @Nested
    @DisplayName("Equipment Rental in Reservation")
    class EquipmentRentalInReservation {

        @Test
        @DisplayName("1 top kiralama: 60dk, 10€/saat → toplam fiyat = 50€ saha + 10€ top = 60€")
        void reservationWithEquipmentRental() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            CreateReservationRequest.EquipmentRentalItem item = new CreateReservationRequest.EquipmentRentalItem();
            item.setEquipmentId(5L);
            item.setQuantity(1);
            item.setSize("5");
            req.setEquipmentRentals(List.of(item));

            Equipment ball = Equipment.builder()
                    .id(5L)
                    .name("Futbol Topu")
                    .rentable(true)
                    .rentalPricePerHour(new BigDecimal("10.00"))
                    .quantity(10)
                    .build();

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(equipmentRepository.findById(5L)).thenReturn(Optional.of(ball));
            doNothing().when(equipmentService).validateStock(eq(5L), eq("5"), eq(1), any(), any());
            when(reservationRepository.save(any())).thenAnswer(i -> {
                Reservation r = i.getArgument(0);
                r.setId(600L);
                return r;
            });
            when(equipmentRentalRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            ReservationResponse response = reservationService.createReservation(req, 10L);

            assertThat(response.getTotalPrice()).isEqualByComparingTo(new BigDecimal("60.00"));
        }

        @Test
        @DisplayName("90dk kiralama: top 10€/saat × 1.5h × 2 adet = 30€ → toplam 75€ + 30€ = 105€")
        void reservationWithMultipleEquipment90Min() {
            CreateReservationRequest req = createRequest(14, 0, 90);
            CreateReservationRequest.EquipmentRentalItem item = new CreateReservationRequest.EquipmentRentalItem();
            item.setEquipmentId(5L);
            item.setQuantity(2);
            item.setSize("5");
            req.setEquipmentRentals(List.of(item));

            Equipment ball = Equipment.builder()
                    .id(5L)
                    .name("Futbol Topu")
                    .rentable(true)
                    .rentalPricePerHour(new BigDecimal("10.00"))
                    .quantity(10)
                    .build();

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(equipmentRepository.findById(5L)).thenReturn(Optional.of(ball));
            doNothing().when(equipmentService).validateStock(any(), any(), anyInt(), any(), any());
            when(reservationRepository.save(any())).thenAnswer(i -> {
                Reservation r = i.getArgument(0);
                r.setId(601L);
                return r;
            });
            when(equipmentRentalRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            ReservationResponse response = reservationService.createReservation(req, 10L);

            assertThat(response.getTotalPrice()).isEqualByComparingTo(new BigDecimal("105.00"));
        }

        @Test
        @DisplayName("kiralık olmayan ekipman → exception")
        void nonRentableEquipmentThrows() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            CreateReservationRequest.EquipmentRentalItem item = new CreateReservationRequest.EquipmentRentalItem();
            item.setEquipmentId(5L);
            item.setQuantity(1);
            item.setSize("M");
            req.setEquipmentRentals(List.of(item));

            Equipment vest = Equipment.builder()
                    .id(5L)
                    .name("Leibchen")
                    .rentable(false)
                    .build();

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(equipmentRepository.findById(5L)).thenReturn(Optional.of(vest));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("Leibchen");

            verify(reservationRepository, never()).save(any());
        }
    }


    @Nested
    @DisplayName("Inactive Field")
    class InactiveField {

        @Test
        @DisplayName("aktif olmayan saha → exception")
        void inactiveFieldThrows() {
            testField.setActive(false);
            CreateReservationRequest req = createRequest(14, 0, 60);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("nicht verfügbar");
        }
    }


    @Nested
    @DisplayName("Field Not Found")
    class FieldNotFound {

        @Test
        @DisplayName("olmayan saha ID → ResourceNotFoundException")
        void fieldNotFound() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setFieldId(999L);

            when(fieldRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }


    @Nested
    @DisplayName("Price Calculation Edge Cases")
    class PriceEdgeCases {

        @Test
        @DisplayName("120dk termin — fiyat 2× saatlik ücret (100€)")
        void price120Min() {
            CreateReservationRequest req = createRequest(14, 0, 120);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(reservationRepository.save(any())).thenAnswer(i -> {
                Reservation r = i.getArgument(0);
                r.setId(700L);
                return r;
            });

            ReservationResponse response = reservationService.createReservation(req, 10L);

            assertThat(response.getTotalPrice()).isEqualByComparingTo(new BigDecimal("100.00"));
        }

        @Test
        @DisplayName("farklı saatlik ücretli saha (80€/saat) — 90dk = 120€")
        void differentHourlyPrice() {
            testField.setHourlyPrice(new BigDecimal("80.00"));
            CreateReservationRequest req = createRequest(14, 0, 90);

            when(appSettingsService.getSportPrice("FOOTBALL")).thenReturn(new BigDecimal("80.00"));
            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(reservationRepository.save(any())).thenAnswer(i -> {
                Reservation r = i.getArgument(0);
                r.setId(701L);
                return r;
            });

            ReservationResponse response = reservationService.createReservation(req, 10L);

            assertThat(response.getTotalPrice()).isEqualByComparingTo(new BigDecimal("120.00"));
        }
    }


    @Nested
    @DisplayName("Confirmation Code")
    class ConfirmationCodeTests {

        @Test
        @DisplayName("onay kodu RES- ile başlamalı")
        void confirmationCodeFormat() {
            CreateReservationRequest req = createRequest(14, 0, 60);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(reservationRepository.findByConfirmationCode(any()))
                    .thenReturn(Optional.empty());
            when(reservationRepository.save(any())).thenAnswer(i -> {
                Reservation r = i.getArgument(0);
                r.setId(800L);
                return r;
            });

            ReservationResponse response = reservationService.createReservation(req, 10L);

            assertThat(response.getConfirmationCode()).startsWith("FU-");
            assertThat(response.getConfirmationCode()).hasSize(9);
        }
    }
}
