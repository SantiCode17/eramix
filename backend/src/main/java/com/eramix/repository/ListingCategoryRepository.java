package com.eramix.repository;

import com.eramix.entity.ListingCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingCategoryRepository extends JpaRepository<ListingCategory, Long> {
}
