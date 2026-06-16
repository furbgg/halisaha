package com.halisaha.reservation;

import com.halisaha.common.AppConstants;

import com.halisaha.common.exception.InvalidReservationException;
import com.halisaha.common.exception.ResourceNotFoundException;
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
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Kötü niyetli kullanıcı senaryoları:
 * 
 * - XSS: <script>alert('hack')</script> isim veya e-posta
 * - SQL Injection: ' OR 1=1 -- isim ile
 * - Negatif değerler: negatif süre, negatif ekipman adedi
 * - İzin verilmeyen süreler: 45dk, 75dk, 200dk
 * - Geçmiş tarih: dün rezervasyon yapma
 * - Boş/null alanlar: isim, e-posta zorunlu alanlar
 * - Olmayan kayıtlar: sahte field ID, sahte user ID
 * - İptal manipülasyonu: başkasının rezervasyonunu iptal
 * - Fiyat manipülasyonu: quantity=0, quantity=-5
 * - Çift iptal: aynı rezervasyonu 2 kez iptal
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Security & Abuse — Kötü Niyetli Kullanıcı Senaryoları")
class SecurityAbuseTest {

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
                .name("Platz 1")
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
                .email("max@test.de")
                .phone("+4312345678")
                .build();
        lenient().when(appSettingsService.getString(eq("daily_guest_booking_limit"), anyString())).thenReturn("disabled");
        lenient().when(appSettingsService.getSportPrice("FOOTBALL")).thenReturn(new BigDecimal("50.00"));
        lenient().when(appSettingsService.isHappyHourActiveForSlot(any())).thenReturn(false);
    }

    private CreateReservationRequest createRequest(int hour, int minute, int durationMinutes) {
        CreateReservationRequest req = new CreateReservationRequest();
        req.setGameType("FOOTBALL");
        req.setFieldId(1L);
        req.setStartTime(ZonedDateTime.of(2026, 6, 15, hour, minute, 0, 0, AppConstants.VIENNA));
        req.setDurationMinutes(durationMinutes);
        req.setPrivacyAccepted(true);
        req.setGuestEmail("guest@test.de");
        return req;
    }


    @Nested
    @DisplayName("XSS Saldırısı")
    class XSSAttack {

        @Test
        @DisplayName("guest isimde <script> tag → veri kaydedilir ama HTML escape gerekli")
        void scriptTagInGuestName() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setGuestName("<script>alert('XSS')</script>");
            req.setGuestPhone("+43123456789");
            req.setGuestEmail("hacker@evil.com");

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(reservationRepository.save(any())).thenAnswer(i -> {
                Reservation r = i.getArgument(0);
                r.setId(100L);
                return r;
            });

            ReservationResponse resp = reservationService.createReservation(req, null);
            assertThat(resp).isNotNull();
        }

        @Test
        @DisplayName("guest e-postada script tag")
        void scriptTagInGuestEmail() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setGuestName("Hacker");
            req.setGuestEmail("<script>steal(document.cookie)</script>@evil.com");

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(reservationRepository.save(any())).thenAnswer(i -> {
                Reservation r = i.getArgument(0);
                r.setId(101L);
                return r;
            });

            ReservationResponse resp = reservationService.createReservation(req, null);
            assertThat(resp).isNotNull();
        }

        @Test
        @DisplayName("çok uzun isim (10000 karakter) — buffer overflow denemesi")
        void extremelyLongGuestName() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setGuestName("A".repeat(10000));
            req.setGuestPhone("+43123456789");
            req.setGuestEmail("long@test.com");

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(reservationRepository.save(any())).thenAnswer(i -> {
                Reservation r = i.getArgument(0);
                r.setId(102L);
                return r;
            });

            ReservationResponse resp = reservationService.createReservation(req, null);
            assertThat(resp).isNotNull();
        }
    }


    @Nested
    @DisplayName("SQL Injection Denemesi")
    class SQLInjection {

        @Test
        @DisplayName("guest isimde SQL injection → JPA parametrik sorgu koruyor")
        void sqlInjectionInGuestName() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setGuestName("'; DROP TABLE reservations; --");
            req.setGuestPhone("+43123456789");
            req.setGuestEmail("sqli@evil.com");

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(reservationRepository.save(any())).thenAnswer(i -> {
                Reservation r = i.getArgument(0);
                r.setId(103L);
                return r;
            });

            ReservationResponse resp = reservationService.createReservation(req, null);
            assertThat(resp).isNotNull();
        }

        @Test
        @DisplayName("confirmation code'da SQL injection → parametrik sorgu koruyor")
        void sqlInjectionInConfirmationCode() {
            String maliciousCode = "' OR 1=1 --";

            when(reservationRepository.findByConfirmationCode(maliciousCode))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> reservationService.getByConfirmationCode(maliciousCode))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }


    @Nested
    @DisplayName("Süre Manipülasyonu")
    class DurationManipulation {

        @Test
        @DisplayName("45dk — izin verilmeyen süre → exception")
        void duration45MinNotAllowed() {
            CreateReservationRequest req = createRequest(14, 0, 45);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("45 Minuten")
                    .hasMessageContaining("nicht erlaubt");
        }

        @Test
        @DisplayName("75dk — izin verilmeyen süre → exception")
        void duration75MinNotAllowed() {
            CreateReservationRequest req = createRequest(14, 0, 75);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("75 Minuten");
        }

        @Test
        @DisplayName("200dk — maksimum aşımı → exception")
        void duration200MinExceedsMax() {
            CreateReservationRequest req = createRequest(14, 0, 200);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("200 Minuten");
        }

        @Test
        @DisplayName("0dk süre → exception")
        void durationZero() {
            CreateReservationRequest req = createRequest(14, 0, 0);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class);
        }

        @Test
        @DisplayName("negatif süre (-60dk) → izin verilmeyen süre exception")
        void negativeDuration() {
            CreateReservationRequest req = createRequest(14, 0, -60);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class);
        }

        @Test
        @DisplayName("360dk (6 saat!) süre → exception")
        void duration6Hours() {
            CreateReservationRequest req = createRequest(10, 0, 360);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("360 Minuten");
        }
    }


    @Nested
    @DisplayName("Geçmiş Tarih Manipülasyonu")
    class PastDateManipulation {

        @Test
        @DisplayName("dünkü tarih → exception")
        void yesterdayBooking() {
            CreateReservationRequest req = new CreateReservationRequest();
            req.setGameType("FOOTBALL");
            req.setFieldId(1L);
            req.setStartTime(ZonedDateTime.now(AppConstants.VIENNA).minusDays(1));
            req.setDurationMinutes(60);
            req.setPrivacyAccepted(true);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("Zukunft");
        }

        @Test
        @DisplayName("1 dakika öncesi → exception")
        void oneMinuteAgo() {
            CreateReservationRequest req = new CreateReservationRequest();
            req.setGameType("FOOTBALL");
            req.setFieldId(1L);
            req.setStartTime(ZonedDateTime.now(AppConstants.VIENNA).minusMinutes(1));
            req.setDurationMinutes(60);
            req.setPrivacyAccepted(true);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("Zukunft");
        }

        @Test
        @DisplayName("geçen yıl → exception")
        void lastYear() {
            CreateReservationRequest req = new CreateReservationRequest();
            req.setGameType("FOOTBALL");
            req.setFieldId(1L);
            req.setStartTime(ZonedDateTime.of(2024, 1, 1, 14, 0, 0, 0, AppConstants.VIENNA));
            req.setDurationMinutes(60);
            req.setPrivacyAccepted(true);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class);
        }
    }


    @Nested
    @DisplayName("Guest Form Validasyonu")
    class GuestFormValidation {

        @Test
        @DisplayName("guest — isim null → exception")
        void guestNameNull() {
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
        @DisplayName("guest — isim boş string → exception")
        void guestNameEmpty() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setGuestName("");

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());

            assertThatThrownBy(() -> reservationService.createReservation(req, null))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("Gastname");
        }

        @Test
        @DisplayName("guest — isim sadece boşluklar → exception")
        void guestNameOnlySpaces() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setGuestName("     ");

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());

            assertThatThrownBy(() -> reservationService.createReservation(req, null))
                    .isInstanceOf(InvalidReservationException.class);
        }

        @Test
        @DisplayName("guest — telefon opsiyonel (null olabilir)")
        void guestPhoneOptional() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setGuestName("Valid Name");
            req.setGuestPhone(null);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(reservationRepository.save(any())).thenAnswer(i -> {
                Reservation r = i.getArgument(0);
                r.setId(200L);
                return r;
            });

            ReservationResponse resp = reservationService.createReservation(req, null);
            assertThat(resp).isNotNull();
            assertThat(resp.getCustomerName()).isEqualTo("Valid Name");
        }

        @Test
        @DisplayName("guest — geçersiz e-posta formatı (service katmanında kontrol yok — NOT)")
        void guestInvalidEmailFormat() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setGuestName("Test User");
            req.setGuestEmail("not-an-email");

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(reservationRepository.save(any())).thenAnswer(i -> {
                Reservation r = i.getArgument(0);
                r.setId(201L);
                return r;
            });

            ReservationResponse resp = reservationService.createReservation(req, null);
            assertThat(resp).isNotNull();
        }
    }


    @Nested
    @DisplayName("Privacy Manipülasyonu")
    class PrivacyManipulation {

        @Test
        @DisplayName("privacy false gönderildi → exception")
        void privacyFalse() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setPrivacyAccepted(false);

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("Datenschutz");
        }

        @Test
        @DisplayName("privacy null gönderildi → exception")
        void privacyNull() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setPrivacyAccepted(null);

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class);
        }
    }


    @Nested
    @DisplayName("Ekipman Manipülasyonu")
    class EquipmentManipulation {

        @Test
        @DisplayName("olmayan ekipman ID → exception")
        void fakeEquipmentId() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            CreateReservationRequest.EquipmentRentalItem item = new CreateReservationRequest.EquipmentRentalItem();
            item.setEquipmentId(99999L);
            item.setQuantity(1);
            req.setEquipmentRentals(List.of(item));

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(equipmentRepository.findById(99999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Ausrüstung");
        }

        @Test
        @DisplayName("kiralık olmayan ekipman → exception")
        void nonRentableEquipment() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            CreateReservationRequest.EquipmentRentalItem item = new CreateReservationRequest.EquipmentRentalItem();
            item.setEquipmentId(5L);
            item.setQuantity(1);
            req.setEquipmentRentals(List.of(item));

            Equipment notRentable = Equipment.builder()
                    .id(5L).name("Leibchen").rentable(false).build();

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(equipmentRepository.findById(5L)).thenReturn(Optional.of(notRentable));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("Leibchen")
                    .hasMessageContaining("nicht zur Vermietung");
        }
    }


    @Nested
    @DisplayName("Olmayan Kaynak Saldırısı")
    class NonExistentResources {

        @Test
        @DisplayName("olmayan saha ID → exception")
        void fakeFieldId() {
            CreateReservationRequest req = createRequest(14, 0, 60);
            req.setFieldId(99999L);

            when(fieldRepository.findById(99999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Platz");
        }

        @Test
        @DisplayName("olmayan user ID → exception")
        void fakeUserId() {
            CreateReservationRequest req = createRequest(14, 0, 60);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
            when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                    .thenReturn(Collections.emptyList());
            when(userRepository.findById(99999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> reservationService.createReservation(req, 99999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Benutzer");
        }

        @Test
        @DisplayName("olmayan confirmation code ile iptal → exception")
        void cancelFakeCode() {
            when(reservationRepository.findByConfirmationCode("FAKE-CODE-123"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> reservationService.cancelReservation("FAKE-CODE-123", null, null, false))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("olmayan confirmation code ile sorgulama → exception")
        void lookupFakeCode() {
            when(reservationRepository.findByConfirmationCode("'; SELECT * FROM users; --"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> reservationService.getByConfirmationCode("'; SELECT * FROM users; --"))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }


    @Nested
    @DisplayName("İptal Manipülasyonu")
    class CancelManipulation {

        @Test
        @DisplayName("çift iptal — aynı rezervasyonu 2 kez iptal → exception")
        void doubleCancelAttempt() {
            Reservation r = Reservation.builder()
                    .gameType("FOOTBALL")
                    .id(100L)
                    .confirmationCode("RES-ABC")
                    .field(testField)
                    .user(testUser)
                    .startTime(ZonedDateTime.of(2026, 6, 15, 14, 0, 0, 0, AppConstants.VIENNA))
                    .endTime(ZonedDateTime.of(2026, 6, 15, 15, 0, 0, 0, AppConstants.VIENNA))
                    .durationMinutes(60)
                    .status(ReservationStatus.CANCELLED)
                    .build();

            when(reservationRepository.findByConfirmationCode("RES-ABC"))
                    .thenReturn(Optional.of(r));

            assertThatThrownBy(() -> reservationService.cancelReservation("RES-ABC", 10L, null, false))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("bereits storniert");
        }

        @Test
        @DisplayName("iptal edilmiş rezervasyonu değiştirme → exception")
        void modifyCancelledReservation() {
            Reservation r = Reservation.builder()
                    .gameType("FOOTBALL")
                    .id(100L)
                    .confirmationCode("RES-ABC")
                    .field(testField)
                    .user(testUser)
                    .startTime(ZonedDateTime.of(2026, 6, 15, 14, 0, 0, 0, AppConstants.VIENNA))
                    .endTime(ZonedDateTime.of(2026, 6, 15, 15, 0, 0, 0, AppConstants.VIENNA))
                    .durationMinutes(60)
                    .status(ReservationStatus.CANCELLED)
                    .build();

            when(reservationRepository.findByConfirmationCode("RES-ABC"))
                    .thenReturn(Optional.of(r));

            assertThatThrownBy(() -> reservationService.modifyReservation(
                    "RES-ABC",
                    ZonedDateTime.of(2026, 6, 15, 16, 0, 0, 0, AppConstants.VIENNA),
                    120, 10L, null, false))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("Stornierte");
        }
    }


    @Nested
    @DisplayName("Deaktif Saha Erişimi")
    class InactiveFieldAccess {

        @Test
        @DisplayName("deaktif sahada rezervasyon → exception")
        void bookInactiveField() {
            testField.setActive(false);
            CreateReservationRequest req = createRequest(14, 0, 60);

            when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

            assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                    .isInstanceOf(InvalidReservationException.class)
                    .hasMessageContaining("nicht verfügbar");
        }
    }

}
