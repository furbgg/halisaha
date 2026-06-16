package com.halisaha.equipment;

import com.halisaha.common.dto.ApiResponse;
import com.halisaha.common.exception.ResourceNotFoundException;
import com.halisaha.equipment.dto.BulkSizeStockRequest;
import com.halisaha.equipment.dto.SizeStockRequest;
import com.halisaha.equipment.dto.SizeStockResponse;
import com.halisaha.equipment.entity.Equipment;
import com.halisaha.equipment.entity.EquipmentSizeStock;
import com.halisaha.equipment.repository.EquipmentRepository;
import com.halisaha.equipment.repository.EquipmentSizeStockRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/equipment")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminEquipmentController {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentSizeStockRepository equipmentSizeStockRepository;
    private final EquipmentService equipmentService;


    @GetMapping
    public ResponseEntity<ApiResponse<List<Equipment>>> getAll() {
        List<Equipment> equipment = equipmentRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(equipment));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Equipment>> getById(@PathVariable Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ausrüstung nicht gefunden"));
        return ResponseEntity.ok(ApiResponse.success(equipment));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Equipment>> create(@RequestBody Equipment equipment) {
        Equipment saved = equipmentRepository.save(equipment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ausrüstung erstellt", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Equipment>> update(@PathVariable Long id, @RequestBody Equipment updated) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ausrüstung nicht gefunden"));

        equipment.setName(updated.getName());
        equipment.setCategory(updated.getCategory());
        equipment.setQuantity(updated.getQuantity());
        equipment.setCondition(updated.getCondition());
        equipment.setRentable(updated.getRentable());
        equipment.setRentalPricePerHour(updated.getRentalPricePerHour());
        equipment.setAvailableSizes(updated.getAvailableSizes());

        Equipment saved = equipmentRepository.save(equipment);
        return ResponseEntity.ok(ApiResponse.success("Ausrüstung aktualisiert", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ausrüstung nicht gefunden"));
        equipment.setRentable(false);
        equipmentRepository.save(equipment);
        return ResponseEntity.ok(ApiResponse.success("Ausrüstung deaktiviert", null));
    }


    @GetMapping("/{id}/sizes")
    public ResponseEntity<ApiResponse<List<SizeStockResponse>>> getSizeStocks(@PathVariable Long id) {
        equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ausrüstung nicht gefunden"));

        List<SizeStockResponse> stocks = equipmentSizeStockRepository.findByEquipmentId(id)
                .stream()
                .map(s -> SizeStockResponse.builder()
                        .id(s.getId())
                        .size(s.getSize())
                        .quantity(s.getQuantity())
                        .build())
                .toList();
        return ResponseEntity.ok(ApiResponse.success(stocks));
    }

    @PutMapping("/{id}/sizes")
    public ResponseEntity<ApiResponse<List<SizeStockResponse>>> setSizeStocks(
            @PathVariable Long id,
            @Valid @RequestBody BulkSizeStockRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ausrüstung nicht gefunden"));

        List<EquipmentSizeStock> existing = equipmentSizeStockRepository.findByEquipmentId(id);
        equipmentSizeStockRepository.deleteAll(existing);
        equipmentSizeStockRepository.flush();

        List<EquipmentSizeStock> newStocks = request.getSizeStocks().stream()
                .map(s -> EquipmentSizeStock.builder()
                        .equipment(equipment)
                        .size(s.getSize())
                        .quantity(s.getQuantity())
                        .build())
                .toList();
        List<EquipmentSizeStock> saved = equipmentSizeStockRepository.saveAll(newStocks);

        equipmentService.syncEquipmentQuantity(id);

        List<SizeStockResponse> response = saved.stream()
                .map(s -> SizeStockResponse.builder()
                        .id(s.getId())
                        .size(s.getSize())
                        .quantity(s.getQuantity())
                        .build())
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Größenbestände aktualisiert", response));
    }

    @PatchMapping("/{id}/sizes/{size}")
    public ResponseEntity<ApiResponse<SizeStockResponse>> updateSizeStock(
            @PathVariable Long id,
            @PathVariable String size,
            @Valid @RequestBody SizeStockRequest request) {
        equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ausrüstung nicht gefunden"));

        EquipmentSizeStock stock = equipmentSizeStockRepository.findByEquipmentIdAndSize(id, size)
                .orElseThrow(() -> new ResourceNotFoundException("Größe " + size + " nicht gefunden"));

        stock.setQuantity(request.getQuantity());
        equipmentSizeStockRepository.save(stock);

        equipmentService.syncEquipmentQuantity(id);

        SizeStockResponse response = SizeStockResponse.builder()
                .id(stock.getId())
                .size(stock.getSize())
                .quantity(stock.getQuantity())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Bestand aktualisiert", response));
    }

    @DeleteMapping("/{id}/sizes/{size}")
    public ResponseEntity<ApiResponse<Void>> deleteSizeStock(
            @PathVariable Long id,
            @PathVariable String size) {
        equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ausrüstung nicht gefunden"));

        EquipmentSizeStock stock = equipmentSizeStockRepository.findByEquipmentIdAndSize(id, size)
                .orElseThrow(() -> new ResourceNotFoundException("Größe " + size + " nicht gefunden"));

        equipmentSizeStockRepository.delete(stock);

        equipmentService.syncEquipmentQuantity(id);

        return ResponseEntity.ok(ApiResponse.success("Größe entfernt", null));
    }
}
