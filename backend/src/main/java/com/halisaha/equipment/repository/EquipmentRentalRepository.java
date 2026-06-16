package com.halisaha.equipment.repository;

import com.halisaha.equipment.RentalStatus;
import com.halisaha.equipment.entity.EquipmentRental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EquipmentRentalRepository extends JpaRepository<EquipmentRental, Long> {

       List<EquipmentRental> findByReservationId(Long reservationId);

       List<EquipmentRental> findByReservationIdIn(List<Long> reservationIds);

       List<EquipmentRental> findByEquipmentIdAndStatus(Long equipmentId, RentalStatus status);

       @Query("SELECT COALESCE(SUM(er.quantity), 0) FROM EquipmentRental er " +
                     "JOIN Reservation r ON er.reservationId = r.id " +
                     "WHERE er.equipment.id = :equipmentId AND (:size IS NULL OR er.size = :size) " +
                     "AND r.startTime < :endTime AND r.endTime > :startTime " +
                     "AND r.status <> 'CANCELLED' " +
                     "AND er.status IN ('RESERVED', 'PICKED_UP')")
       int countRentedQuantity(@Param("equipmentId") Long equipmentId,
                     @Param("size") String size,
                     @Param("startTime") java.time.ZonedDateTime startTime,
                     @Param("endTime") java.time.ZonedDateTime endTime);

       @Query("SELECT er.equipment.name, SUM(er.quantity) FROM EquipmentRental er " +
                     "JOIN Reservation r ON er.reservationId = r.id " +
                     "WHERE r.startTime >= :from AND r.startTime < :to " +
                     "AND r.status <> 'CANCELLED' " +
                     "GROUP BY er.equipment.name ORDER BY SUM(er.quantity) DESC")
       List<Object[]> getMostRentedEquipment(@Param("from") java.time.ZonedDateTime from,
                     @Param("to") java.time.ZonedDateTime to);
}
