package com.halisaha.equipment;

import com.halisaha.common.AppConstants;

import com.halisaha.common.exception.InsufficientStockException;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.equipment.entity.Equipment;
import com.halisaha.equipment.repository.EquipmentRentalRepository;
import com.halisaha.equipment.repository.EquipmentRepository;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("EquipmentService — Stock Validation & Availability")
class EquipmentServiceTest {

    @Mock
    private EquipmentRepository equipmentRepository;
    @Mock
    private EquipmentRentalRepository equipmentRentalRepository;
    @Mock
    private com.halisaha.equipment.repository.EquipmentSizeStockRepository equipmentSizeStockRepository;

    @InjectMocks
    private EquipmentService equipmentService;

    private Equipment futbolTopu;
    private Equipment leibchen;

    private final ZonedDateTime START = ZonedDateTime.of(2026, 3, 20, 14, 0, 0, 0, AppConstants.VIENNA);
    private final ZonedDateTime END = ZonedDateTime.of(2026, 3, 20, 15, 0, 0, 0, AppConstants.VIENNA);

    @BeforeEach
    void setUp() {
        futbolTopu = Equipment.builder()
                .id(1L)
                .name("Futbol Topu")
                .category("Top")
                .quantity(10)
                .rentable(true)
                .rentalPricePerHour(new BigDecimal("10.00"))
                .build();

        leibchen = Equipment.builder()
                .id(2L)
                .name("Leibchen")
                .category("Giyim")
                .quantity(20)
                .rentable(true)
                .rentalPricePerHour(new BigDecimal("5.00"))
                .build();
    }


    @Nested
    @DisplayName("Available Stock")
    class AvailableStock {

        @Test
        @DisplayName("hiç kiralama yok → 10 stok müsait")
        void allStockAvailable() {
            when(equipmentRepository.findById(1L)).thenReturn(Optional.of(futbolTopu));
            when(equipmentRentalRepository.countRentedQuantity(eq(1L), eq("5"), any(), any()))
                    .thenReturn(0);

            int available = equipmentService.getAvailableStock(1L, "5", START, END);
            assertThat(available).isEqualTo(10);
        }

        @Test
        @DisplayName("3 kiralı → 7 müsait")
        void partiallyRented() {
            when(equipmentRepository.findById(1L)).thenReturn(Optional.of(futbolTopu));
            when(equipmentRentalRepository.countRentedQuantity(eq(1L), eq("5"), any(), any()))
                    .thenReturn(3);

            int available = equipmentService.getAvailableStock(1L, "5", START, END);
            assertThat(available).isEqualTo(7);
        }

        @Test
        @DisplayName("hepsi kiralı → 0 müsait")
        void allRented() {
            when(equipmentRepository.findById(1L)).thenReturn(Optional.of(futbolTopu));
            when(equipmentRentalRepository.countRentedQuantity(eq(1L), eq("5"), any(), any()))
                    .thenReturn(10);

            int available = equipmentService.getAvailableStock(1L, "5", START, END);
            assertThat(available).isEqualTo(0);
        }

        @Test
        @DisplayName("olmayan ekipman → exception")
        void equipmentNotFound() {
            when(equipmentRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> equipmentService.getAvailableStock(99L, "5", START, END))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }


    @Nested
    @DisplayName("Validate Stock")
    class ValidateStockTests {

        @Test
        @DisplayName("yeterli stok → exception yok")
        void sufficientStock() {
            when(equipmentRepository.findById(1L)).thenReturn(Optional.of(futbolTopu));
            when(equipmentRentalRepository.countRentedQuantity(eq(1L), eq("5"), any(), any()))
                    .thenReturn(5);

            equipmentService.validateStock(1L, "5", 3, START, END);
        }

        @Test
        @DisplayName("yetersiz stok → InsufficientStockException")
        void insufficientStock() {
            when(equipmentRepository.findById(1L)).thenReturn(Optional.of(futbolTopu));
            when(equipmentRentalRepository.countRentedQuantity(eq(1L), eq("5"), any(), any()))
                    .thenReturn(8);

            assertThatThrownBy(() -> equipmentService.validateStock(1L, "5", 5, START, END))
                    .isInstanceOf(InsufficientStockException.class)
                    .hasMessageContaining("Futbol Topu")
                    .hasMessageContaining("2 verfügbar")
                    .hasMessageContaining("5 angefordert");
        }

        @Test
        @DisplayName("tam yeterli stok (edge: available == requested) → exception yok")
        void exactlyEnoughStock() {
            when(equipmentRepository.findById(2L)).thenReturn(Optional.of(leibchen));
            when(equipmentRentalRepository.countRentedQuantity(eq(2L), eq("M"), any(), any()))
                    .thenReturn(17);

            equipmentService.validateStock(2L, "M", 3, START, END);
        }

        @Test
        @DisplayName("stok = 0, 1 isteniyor → exception")
        void zeroStockThrows() {
            when(equipmentRepository.findById(1L)).thenReturn(Optional.of(futbolTopu));
            when(equipmentRentalRepository.countRentedQuantity(eq(1L), eq("5"), any(), any()))
                    .thenReturn(10);

            assertThatThrownBy(() -> equipmentService.validateStock(1L, "5", 1, START, END))
                    .isInstanceOf(InsufficientStockException.class);
        }

        @Test
        @DisplayName("farklı beden stok kontrolü (M vs L bağımsız)")
        void differentSizesIndependent() {
            when(equipmentRepository.findById(2L)).thenReturn(Optional.of(leibchen));
            when(equipmentRentalRepository.countRentedQuantity(eq(2L), eq("M"), any(), any()))
                    .thenReturn(18);
            when(equipmentRentalRepository.countRentedQuantity(eq(2L), eq("L"), any(), any()))
                    .thenReturn(5);

            assertThatThrownBy(() -> equipmentService.validateStock(2L, "M", 3, START, END))
                    .isInstanceOf(InsufficientStockException.class);

            equipmentService.validateStock(2L, "L", 3, START, END);
        }
    }
}
