package com.eramix.repository;

import com.eramix.entity.EscrowTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EscrowTransactionRepository extends JpaRepository<EscrowTransaction, Long> {
    Optional<EscrowTransaction> findByStripePaymentIntent(String paymentIntentId);
    List<EscrowTransaction> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    List<EscrowTransaction> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    Optional<EscrowTransaction> findByListingId(Long listingId);
}
