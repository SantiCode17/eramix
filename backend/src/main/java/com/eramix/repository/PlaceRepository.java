package com.eramix.repository;

import com.eramix.entity.Place;
import com.eramix.entity.enums.PlaceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Long> {
    List<Place> findByCityIgnoreCaseOrderByCreatedAtDesc(String city);
    List<Place> findByCategoryOrderByCreatedAtDesc(PlaceCategory category);
    List<Place> findByCityIgnoreCaseAndCategoryOrderByCreatedAtDesc(String city, PlaceCategory category);
    List<Place> findAllByOrderByCreatedAtDesc();
}
