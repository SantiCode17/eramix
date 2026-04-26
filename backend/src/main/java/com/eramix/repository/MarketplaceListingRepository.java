package com.eramix.repository;

import com.eramix.entity.MarketplaceListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarketplaceListingRepository extends JpaRepository<MarketplaceListing, Long> {
    Page<MarketplaceListing> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<MarketplaceListing> findByCityAndStatusOrderByCreatedAtDesc(String city, String status, Pageable pageable);
    List<MarketplaceListing> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    Page<MarketplaceListing> findByCategoryIdAndStatusOrderByCreatedAtDesc(Long categoryId, String status, Pageable pageable);
}
