package com.halisaha.reservation;

import com.halisaha.common.AppConstants;

import com.halisaha.common.exception.InvalidReservationException;
import com.halisaha.common.exception.SlotAlreadyBookedException;
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

@ExtendWith(MockitoExtension.class)
@DisplayName("ReservationService — Booking, Conflicts & Price Calculation")
class ReservationServiceTest {

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
        private EmailService emailService;
        @Mock
        private com.halisaha.common.service.AppSettingsService appSettingsService;
        @Mock
        private com.halisaha.equipment.EquipmentService equipmentService;
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
                return req;
        }


        @Nested
        @DisplayName("Successful Booking")
        class SuccessfulBooking {

                @Test
                @DisplayName("60dk termin — başarılı oluşturma + doğru fiyat")
                void createReservation60Min() {
                        CreateReservationRequest req = createRequest(14, 0, 60);

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(Collections.emptyList());
                        when(reservationRepository.save(any())).thenAnswer(i -> {
                                Reservation r = i.getArgument(0);
                                r.setId(100L);
                                return r;
                        });

                        ReservationResponse response = reservationService.createReservation(req, 10L);

                        assertThat(response.getDurationMinutes()).isEqualTo(60);
                        assertThat(response.getTotalPrice()).isEqualByComparingTo(new BigDecimal("50.00"));
                }

                @Test
                @DisplayName("90dk termin — fiyat 1.5× saatlik ücret")
                void createReservation90MinCorrectPrice() {
                        CreateReservationRequest req = createRequest(14, 0, 90);

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(Collections.emptyList());
                        when(reservationRepository.save(any())).thenAnswer(i -> {
                                Reservation r = i.getArgument(0);
                                r.setId(101L);
                                return r;
                        });

                        ReservationResponse response = reservationService.createReservation(req, 10L);

                        assertThat(response.getTotalPrice()).isEqualByComparingTo(new BigDecimal("75.00"));
                }

                @Test
                @DisplayName("180dk termin — fiyat 3× saatlik ücret")
                void createReservation180MinCorrectPrice() {
                        CreateReservationRequest req = createRequest(10, 0, 180);

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(Collections.emptyList());
                        when(reservationRepository.save(any())).thenAnswer(i -> {
                                Reservation r = i.getArgument(0);
                                r.setId(102L);
                                return r;
                        });

                        ReservationResponse response = reservationService.createReservation(req, 10L);

                        assertThat(response.getTotalPrice()).isEqualByComparingTo(new BigDecimal("150.00"));
                }

                @Test
                @DisplayName("reservation.endTime doğru hesaplanmalı")
                void endTimeCalculatedCorrectly() {
                        CreateReservationRequest req = createRequest(17, 30, 90);

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(Collections.emptyList());
                        when(reservationRepository.save(any())).thenAnswer(i -> {
                                Reservation r = i.getArgument(0);
                                r.setId(103L);
                                return r;
                        });

                        ReservationResponse response = reservationService.createReservation(req, 10L);

                        assertThat(response.getEndTime()).isEqualTo(
                                        ZonedDateTime.of(2026, 3, 20, 19, 0, 0, 0, AppConstants.VIENNA));
                }
        }


        @Nested
        @DisplayName("Conflict Detection")
        class ConflictDetection {

                @Test
                @DisplayName("aynı saat aynı saha → SlotAlreadyBookedException")
                void exactSameSlotConflict() {
                        CreateReservationRequest req = createRequest(14, 0, 60);

                        Reservation existing = Reservation.builder()
                                .gameType("FOOTBALL")
                                        .id(50L)
                                        .startTime(req.getStartTime())
                                        .endTime(req.getStartTime().plusMinutes(60))
                                        .build();

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(List.of(existing));

                        assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                                        .isInstanceOf(SlotAlreadyBookedException.class);

                        verify(reservationRepository, never()).save(any());
                }

                @Test
                @DisplayName("kısmi çakışma (14:00-15:30 mevcut, 15:00-16:30 isteniyor) → REDDEDILMELI")
                void partialOverlapConflict() {
                        CreateReservationRequest req = createRequest(15, 0, 90);

                        Reservation existing = Reservation.builder()
                                .gameType("FOOTBALL")
                                        .id(51L)
                                        .startTime(ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA))
                                        .endTime(ZonedDateTime.of(2026, 3, 20, 15, 30, 0, 0, AppConstants.VIENNA))
                                        .build();

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(List.of(existing));

                        assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                                        .isInstanceOf(SlotAlreadyBookedException.class);
                }

                @Test
                @DisplayName("bitişik slotlar (14:00-15:00 mevcut, 15:00-16:00 isteniyor) → KABUL EDİLMELİ")
                void adjacentSlotsNoConflict() {
                        CreateReservationRequest req = createRequest(15, 0, 60);

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(Collections.emptyList());
                        when(reservationRepository.save(any())).thenAnswer(i -> {
                                Reservation r = i.getArgument(0);
                                r.setId(104L);
                                return r;
                        });

                        ReservationResponse response = reservationService.createReservation(req, 10L);
                        assertThat(response).isNotNull();
                }

                @Test
                @DisplayName("içeren çakışma (12:00-15:00 mevcut, 13:00-14:00 isteniyor) → REDDEDILMELI")
                void containedOverlapConflict() {
                        CreateReservationRequest req = createRequest(13, 0, 60);

                        Reservation existing = Reservation.builder()
                                .gameType("FOOTBALL")
                                        .id(52L)
                                        .startTime(ZonedDateTime.of(2026, 3, 20, 12, 0, 0, 0, AppConstants.VIENNA))
                                        .endTime(ZonedDateTime.of(2026, 3, 20, 15, 0, 0, 0, AppConstants.VIENNA))
                                        .build();

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(List.of(existing));

                        assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                                        .isInstanceOf(SlotAlreadyBookedException.class);
                }
        }


        @Nested
        @DisplayName("Validation")
        class Validation {

                @Test
                @DisplayName("izin verilmeyen süre (45dk) → InvalidReservationException")
                void disallowedDurationRejected() {
                        CreateReservationRequest req = createRequest(14, 0, 45);

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

                        assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                                        .isInstanceOf(InvalidReservationException.class)
                                        .hasMessageContaining("45");
                }

                @Test
                @DisplayName("geçmiş zaman → InvalidReservationException")
                void pastStartTimeRejected() {
                        CreateReservationRequest req = new CreateReservationRequest();
                        req.setGameType("FOOTBALL");
                        req.setFieldId(testField.getId());
                        req.setStartTime(ZonedDateTime.of(2020, 1, 1, 14, 0, 0, 0, AppConstants.VIENNA));
                        req.setDurationMinutes(60);
                        req.setPrivacyAccepted(true);

                        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

                        assertThatThrownBy(() -> reservationService.createReservation(req, 10L))
                                        .isInstanceOf(InvalidReservationException.class)
                                        .hasMessageContaining("Zukunft");
                }
        }


        @Nested
        @DisplayName("Modify Reservation")
        class ModifyReservation {

                @Test
                @DisplayName("60dk→90dk değişiklik — yeni çakışma yoksa başarılı")
                void modifyDurationNoConflict() {
                        Reservation existing = Reservation.builder()
                                .gameType("FOOTBALL")
                                        .id(200L)
                                        .confirmationCode("ABC123")
                                        .field(testField)
                                        .user(testUser)
                                        .startTime(ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA))
                                        .endTime(ZonedDateTime.of(2026, 3, 20, 15, 0, 0, 0, AppConstants.VIENNA))
                                        .durationMinutes(60)
                                        .totalPrice(new BigDecimal("50.00"))
                                        .status(ReservationStatus.CONFIRMED)
                                        .build();

                        when(reservationRepository.findByConfirmationCode("ABC123"))
                                        .thenReturn(Optional.of(existing));
                        when(equipmentRentalRepository.findByReservationId(200L))
                                        .thenReturn(Collections.emptyList());
                        when(reservationRepository.findConflictingReservations(eq(1L), any(), any()))
                                        .thenReturn(new java.util.ArrayList<>(List.of(existing)));
                        when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

                        ReservationResponse response = reservationService.modifyReservation(
                                        "ABC123",
                                        ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA),
                                        90,
                                        10L, null, false);

                        assertThat(response.getDurationMinutes()).isEqualTo(90);
                        assertThat(response.getTotalPrice()).isEqualByComparingTo(new BigDecimal("75.00"));
                        assertThat(response.getEndTime()).isEqualTo(
                                        ZonedDateTime.of(2026, 3, 20, 15, 30, 0, 0, AppConstants.VIENNA));
                }
        }
}
