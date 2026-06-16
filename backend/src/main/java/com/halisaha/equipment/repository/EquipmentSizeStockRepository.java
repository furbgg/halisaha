package com.halisaha.equipment.repository;

import com.halisaha.equipment.entity.EquipmentSizeStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EquipmentSizeStockRepository extends JpaRepository<EquipmentSizeStock, Long> {

    List<EquipmentSizeStock> findByEquipmentId(Long equipmentId);

    Optional<EquipmentSizeStock> findByEquipmentIdAndSize(Long equipmentId, String size);

    void deleteByEquipmentIdAndSize(Long equipmentId, String size);

    @Query("SELECT COALESCE(SUM(s.quantity), 0) FROM EquipmentSizeStock s WHERE s.equipment.id = :equipmentId")
    int sumQuantityByEquipmentId(@Param("equipmentId") Long equipmentId);

    boolean existsByEquipmentId(Long equipmentId);
}
