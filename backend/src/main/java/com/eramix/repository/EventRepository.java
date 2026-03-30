package com.eramix.repository;

import com.eramix.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByCreatorId(Long creatorId);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.creator.id = :userId")
    long countByCreatorId(@Param("userId") Long userId);

    @Query("SELECT e FROM Event e WHERE e.isPublic = true AND e.startDatetime > :now ORDER BY e.startDatetime ASC")
    Page<Event> findUpcomingPublicEvents(@Param("now") Instant now, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.isPublic = true AND " +
            "e.startDatetime > :now AND " +
            "(:category IS NULL OR e.category = :category) " +
            "ORDER BY e.startDatetime ASC")
    Page<Event> findUpcomingByCategory(@Param("now") Instant now, @Param("category") String category, Pageable pageable);
}
