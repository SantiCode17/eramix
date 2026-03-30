package com.eramix.repository;

import com.eramix.entity.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {

    @Query("SELECT s FROM Story s WHERE s.user.id = :userId AND s.expiresAt > :now ORDER BY s.createdAt DESC")
    List<Story> findActiveByUserId(@Param("userId") Long userId, @Param("now") Instant now);

    @Query("SELECT s FROM Story s WHERE s.expiresAt > :now ORDER BY s.createdAt DESC")
    List<Story> findAllActive(@Param("now") Instant now);

    List<Story> findByExpiresAtBefore(Instant now);
}
