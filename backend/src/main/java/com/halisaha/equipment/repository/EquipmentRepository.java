package com.halisaha.equipment.repository;

import com.halisaha.equipment.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByRentableTrue();

    List<Equipment> findByCategory(String category);
}
