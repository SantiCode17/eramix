package com.eramix.service;

import com.eramix.dto.marketplace.*;
import com.eramix.entity.*;
import com.eramix.entity.enums.EscrowStatus;
import com.eramix.entity.enums.ItemCondition;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceService {

    private final MarketplaceListingRepository listingRepo;
    private final ListingCategoryRepository categoryRepo;
    private final EscrowTransactionRepository escrowRepo;
    private final UserRepository userRepo;

    // ── Listings ─────────────────────────────────────────────────────────

    @Transactional
    public ListingResponse createListing(Long sellerId, CreateListingRequest req) {
        ListingCategory category = categoryRepo.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        MarketplaceListing listing = MarketplaceListing.builder()
                .sellerId(sellerId)
                .title(req.getTitle())
                .description(req.getDescription())
                .price(req.getPrice())
                .currency(req.getCurrency() != null ? req.getCurrency() : "EUR")
                .itemCondition(ItemCondition.valueOf(req.getCondition()))
                .status("ACTIVE")
                .category(category)
                .city(req.getCity())
                .build();

        listing = listingRepo.save(listing);
        return toListingResponse(listing);
    }

    public List<ListingResponse> getListings(String city, int page, int size) {
        Page<MarketplaceListing> result;
        if (city != null && !city.isBlank()) {
            result = listingRepo.findByCityAndStatusOrderByCreatedAtDesc(city, "ACTIVE", PageRequest.of(page, size));
        } else {
            result = listingRepo.findByStatusOrderByCreatedAtDesc("ACTIVE", PageRequest.of(page, size));
        }
        return result.getContent().stream().map(this::toListingResponse).toList();
    }

    public ListingResponse getListing(Long id) {
        MarketplaceListing listing = listingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        return toListingResponse(listing);
    }

    public List<ListingResponse> getMyListings(Long userId) {
        return listingRepo.findBySellerIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toListingResponse).toList();
    }

    @Transactional
    public void deactivateListing(Long listingId, Long userId) {
        MarketplaceListing listing = listingRepo.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        if (!listing.getSellerId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        listing.setStatus("INACTIVE");
        listingRepo.save(listing);
    }

    // ── Escrow ───────────────────────────────────────────────────────────

    @Transactional
    public EscrowResponse initiateEscrow(Long buyerId, InitiateEscrowRequest req) {
        MarketplaceListing listing = listingRepo.findById(req.getListingId())
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if (listing.getSellerId().equals(buyerId)) {
            throw new RuntimeException("Cannot buy your own listing");
        }

        if (!"ACTIVE".equals(listing.getStatus())) {
            throw new RuntimeException("Listing is not available");
        }

        // Mark listing as reserved
        listing.setStatus("RESERVED");
        listingRepo.save(listing);

        EscrowTransaction escrow = EscrowTransaction.builder()
                .listing(listing)
                .buyerId(buyerId)
                .sellerId(listing.getSellerId())
                .amount(listing.getPrice())
                .currency(listing.getCurrency())
                .status(EscrowStatus.RESERVED)
                .build();

        escrow = escrowRepo.save(escrow);
        return toEscrowResponse(escrow);
    }

    @Transactional
    public EscrowResponse confirmMeet(Long escrowId, Long userId, String role) {
        EscrowTransaction escrow = escrowRepo.findById(escrowId)
                .orElseThrow(() -> new RuntimeException("Escrow not found"));

        if ("BUYER".equals(role) && escrow.getBuyerId().equals(userId)) {
            escrow.setStatus(EscrowStatus.MEET_CONFIRMED_BUYER);
        } else if ("SELLER".equals(role) && escrow.getSellerId().equals(userId)) {
            escrow.setStatus(EscrowStatus.MEET_CONFIRMED_SELLER);
        } else {
            throw new RuntimeException("Invalid role or access denied");
        }

        escrow = escrowRepo.save(escrow);
        return toEscrowResponse(escrow);
    }

    @Transactional
    public EscrowResponse completeEscrow(Long escrowId) {
        EscrowTransaction escrow = escrowRepo.findById(escrowId)
                .orElseThrow(() -> new RuntimeException("Escrow not found"));

        escrow.setStatus(EscrowStatus.COMPLETED);
        escrow.setCompletedAt(Instant.now());

        MarketplaceListing listing = escrow.getListing();
        listing.setStatus("SOLD");
        listingRepo.save(listing);

        escrow = escrowRepo.save(escrow);
        return toEscrowResponse(escrow);
    }

    public List<EscrowResponse> getMyEscrows(Long userId) {
        List<EscrowTransaction> asBuyer = escrowRepo.findByBuyerIdOrderByCreatedAtDesc(userId);
        List<EscrowTransaction> asSeller = escrowRepo.findBySellerIdOrderByCreatedAtDesc(userId);
        var all = new java.util.ArrayList<>(asBuyer);
        all.addAll(asSeller);
        all.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return all.stream().map(this::toEscrowResponse).toList();
    }

    // ── Mappers ──────────────────────────────────────────────────────────

    private ListingResponse toListingResponse(MarketplaceListing l) {
        String sellerName = "";
        String sellerPhoto = null;
        try {
            var user = userRepo.findById(l.getSellerId()).orElse(null);
            if (user != null) {
                sellerName = user.getFirstName() + " " + user.getLastName();
                sellerPhoto = user.getProfilePhotoUrl();
            }
        } catch (Exception ignored) {}

        List<String> photos = l.getPhotos() != null
                ? l.getPhotos().stream().map(MarketplacePhoto::getPhotoUrl).toList()
                : Collections.emptyList();

        return ListingResponse.builder()
                .id(l.getId())
                .title(l.getTitle())
                .description(l.getDescription())
                .price(l.getPrice())
                .currency(l.getCurrency())
                .condition(l.getItemCondition() != null ? l.getItemCondition().name() : null)
                .status(l.getStatus())
                .sellerId(l.getSellerId())
                .sellerName(sellerName)
                .sellerPhotoUrl(sellerPhoto)
                .categoryId(l.getCategory() != null ? l.getCategory().getId() : null)
                .categoryName(l.getCategory() != null ? l.getCategory().getName() : null)
                .city(l.getCity())
                .photoUrls(photos)
                .createdAt(l.getCreatedAt() != null ? l.getCreatedAt().toString() : null)
                .build();
    }

    private EscrowResponse toEscrowResponse(EscrowTransaction e) {
        return EscrowResponse.builder()
                .id(e.getId())
                .listingId(e.getListing() != null ? e.getListing().getId() : null)
                .listingTitle(e.getListing() != null ? e.getListing().getTitle() : null)
                .amount(e.getAmount())
                .currency(e.getCurrency())
                .status(e.getStatus() != null ? e.getStatus().name() : null)
                .buyerId(e.getBuyerId())
                .sellerId(e.getSellerId())
                .meetLocationLat(null)
                .meetLocationLng(null)
                .meetScheduledAt(null)
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .build();
    }
}
