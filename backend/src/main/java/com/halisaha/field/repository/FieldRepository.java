package com.halisaha.field.repository;

import com.halisaha.field.entity.Field;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FieldRepository extends JpaRepository<Field, Long> {

    List<Field> findByActiveTrue();

    List<Field> findByActiveTrueOrderByNameAsc();
}
