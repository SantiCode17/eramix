package com.eramix.repository;

import com.eramix.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @EntityGraph(value = "User.profile")
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdWithProfile(@Param("id") Long id);

    List<User> findByDestinationCityIgnoreCase(String city);

    List<User> findByDestinationCountryIgnoreCase(String country);

    @Query("SELECT u FROM User u WHERE u.homeUniversity.id = :universityId")
    List<User> findByHomeUniversityId(@Param("universityId") Long universityId);

    @Query("SELECT u FROM User u WHERE u.hostUniversity.id = :universityId")
    List<User> findByHostUniversityId(@Param("universityId") Long universityId);

    @Query("SELECT u FROM User u WHERE " +
            "(:city IS NULL OR LOWER(u.destinationCity) = LOWER(:city)) AND " +
            "(:country IS NULL OR LOWER(u.destinationCountry) = LOWER(:country)) AND " +
            "(:universityId IS NULL OR u.hostUniversity.id = :universityId) AND " +
            "u.isActive = true")
    Page<User> findByFilters(
            @Param("city") String city,
            @Param("country") String country,
            @Param("universityId") Long universityId,
            Pageable pageable
    );
}
