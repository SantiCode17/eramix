package com.eramix.repository;

import com.eramix.entity.CryptographicTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CryptographicTicketRepository extends JpaRepository<CryptographicTicket, Long> {
    Optional<CryptographicTicket> findByTicketUuid(String ticketUuid);
    List<CryptographicTicket> findByBuyerIdOrderByPurchaseDateDesc(Long buyerId);
    List<CryptographicTicket> findByTicketListingIdAndIsRedeemedFalse(Long ticketListingId);
}
