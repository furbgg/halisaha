package com.halisaha.staff.repository;

import com.halisaha.staff.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffRepository extends JpaRepository<Staff, Long> {

    List<Staff> findByActiveTrue();

    List<Staff> findByRole(String role);
}
