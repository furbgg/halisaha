package com.halisaha.equipment;

import com.halisaha.common.exception.InsufficientStockException;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.common.service.AppSettingsService;
import com.halisaha.equipment.dto.SizeAvailabilityResponse;
import com.halisaha.equipment.entity.Equipment;
import com.halisaha.equipment.entity.EquipmentSizeStock;
import com.halisaha.equipment.repository.EquipmentRepository;
import com.halisaha.equipment.repository.EquipmentRentalRepository;
import com.halisaha.equipment.repository.EquipmentSizeStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentRentalRepository equipmentRentalRepository;
    private final EquipmentSizeStockRepository equipmentSizeStockRepository;
    private final AppSettingsService appSettingsService;

    @Transactional(readOnly = true)
    public List<Equipment> getRentableEquipment() {
        return equipmentRepository.findByRentableTrue();
    }

    /**
     * Gets the krampon cooldown hours from app_settings.
     * Krampon are unavailable for X hours after a reservation ends.
     */
    private int getCooldownHours() {
        return appSettingsService.getInt("krampon_cooldown_hours", 2);
    }

    /**
     * Adjusts the query start time by subtracting cooldown hours.
     * This makes the existing overlap query also catch reservations
     * that ended within the cooldown window before our start time.
     *
     * Example: cooldown=2h, request start=19:00
     * adjustedStart = 17:00 → catches reservations ending between 17:00-19:00
     */
    private ZonedDateTime applyEquipmentCooldown(Equipment equipment, ZonedDateTime startTime) {
        if ("KRAMPON".equalsIgnoreCase(equipment.getCategory())) {
            int cooldown = getCooldownHours();
            if (cooldown > 0) {
                return startTime.minusHours(cooldown);
            }
        }
        return startTime;
    }

    @Transactional(readOnly = true)
    public int getAvailableStock(Long equipmentId, String size, ZonedDateTime startTime, ZonedDateTime endTime) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Ausrüstung nicht gefunden"));

        ZonedDateTime adjustedStart = applyEquipmentCooldown(equipment, startTime);
        int rented = equipmentRentalRepository.countRentedQuantity(equipmentId, size, adjustedStart, endTime);

        if (size != null && !size.isBlank()) {
            var sizeStock = equipmentSizeStockRepository.findByEquipmentIdAndSize(equipmentId, size);
            if (sizeStock.isPresent()) {
                return Math.max(0, sizeStock.get().getQuantity() - rented);
            }
        }

        return Math.max(0, equipment.getQuantity() - rented);
    }

    public void validateStock(Long equipmentId, String size, int requestedQuantity,
                               ZonedDateTime startTime, ZonedDateTime endTime) {
        int available = getAvailableStock(equipmentId, size, startTime, endTime);
        if (available < requestedQuantity) {
            Equipment equipment = equipmentRepository.findById(equipmentId).orElse(null);
            String name = equipment != null ? equipment.getName() : "Ausrüstung";
            String sizeInfo = (size != null && !size.isBlank()) ? " (Größe: " + size + ")" : "";
            throw new InsufficientStockException(
                    name + sizeInfo + ": Nur " + available + " verfügbar, " +
                    requestedQuantity + " angefordert.");
        }
    }

    /**
     * Returns availability for each size of an equipment item within a time window.
     * Respects krampon cooldown period.
     */
    @Transactional(readOnly = true)
    public List<SizeAvailabilityResponse> getSizeAvailability(Long equipmentId,
                                                               ZonedDateTime startTime,
                                                               ZonedDateTime endTime) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Ausrüstung nicht gefunden"));

        ZonedDateTime adjustedStart = applyEquipmentCooldown(equipment, startTime);
        List<EquipmentSizeStock> stocks = equipmentSizeStockRepository.findByEquipmentId(equipmentId);

        if (stocks.isEmpty()) {
            int rented = equipmentRentalRepository.countRentedQuantity(equipmentId, null, adjustedStart, endTime);
            return List.of(SizeAvailabilityResponse.builder()
                    .size(null)
                    .totalStock(equipment.getQuantity())
                    .available(Math.max(0, equipment.getQuantity() - rented))
                    .build());
        }

        return stocks.stream()
                .map(stock -> {
                    int rented = equipmentRentalRepository.countRentedQuantity(
                            equipmentId, stock.getSize(), adjustedStart, endTime);
                    return SizeAvailabilityResponse.builder()
                            .size(stock.getSize())
                            .totalStock(stock.getQuantity())
                            .available(Math.max(0, stock.getQuantity() - rented))
                            .build();
                })
                .toList();
    }

    /**
     * Syncs equipment.quantity and availableSizes from size stock records.
     */
    @Transactional
    public void syncEquipmentQuantity(Long equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Ausrüstung nicht gefunden"));

        if (equipmentSizeStockRepository.existsByEquipmentId(equipmentId)) {
            int total = equipmentSizeStockRepository.sumQuantityByEquipmentId(equipmentId);
            equipment.setQuantity(total);

            List<String> sizes = equipmentSizeStockRepository.findByEquipmentId(equipmentId)
                    .stream()
                    .map(EquipmentSizeStock::getSize)
                    .sorted()
                    .toList();
            equipment.setAvailableSizes(sizes.toArray(new String[0]));

            equipmentRepository.save(equipment);
        }
    }
}
