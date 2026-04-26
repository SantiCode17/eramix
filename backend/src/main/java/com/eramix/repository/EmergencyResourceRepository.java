package com.eramix.repository;

import com.eramix.entity.EmergencyResource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmergencyResourceRepository extends JpaRepository<EmergencyResource, Long> {
    List<EmergencyResource> findByCountryCode(String countryCode);
}
