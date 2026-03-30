package com.eramix.repository;

import com.eramix.entity.University;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UniversityRepository extends JpaRepository<University, Long> {

    List<University> findByCountryIgnoreCase(String country);

    List<University> findByCityIgnoreCase(String city);

    List<University> findByNameContainingIgnoreCase(String name);
}
