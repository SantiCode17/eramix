package com.eramix.repository;

import com.eramix.entity.TicketListing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TicketListingRepository extends JpaRepository<TicketListing, Long> {
    Optional<TicketListing> findByEventId(Long eventId);
}
