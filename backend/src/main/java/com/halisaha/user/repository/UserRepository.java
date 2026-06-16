package com.halisaha.user.repository;

import com.halisaha.user.UserRole;
import com.halisaha.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByDisplayId(String displayId);

    boolean existsByEmail(String email);

    boolean existsByRoleAndActiveTrue(UserRole role);
}
