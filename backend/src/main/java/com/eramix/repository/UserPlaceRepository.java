package com.eramix.repository;

import com.eramix.entity.UserPlace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserPlaceRepository extends JpaRepository<UserPlace, Long> {
    List<UserPlace> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<UserPlace> findByIdAndUserId(Long id, Long userId);
}
