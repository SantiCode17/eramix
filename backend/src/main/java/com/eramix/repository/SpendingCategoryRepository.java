package com.eramix.repository;

import com.eramix.entity.SpendingCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SpendingCategoryRepository extends JpaRepository<SpendingCategory, Long> {
    Optional<SpendingCategory> findByName(String name);
}
