package com.eramix.repository;

import com.eramix.entity.EventParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, EventParticipant.EventParticipantId> {

    List<EventParticipant> findByEventId(Long eventId);

    List<EventParticipant> findByUserId(Long userId);

    long countByEventId(Long eventId);
}
