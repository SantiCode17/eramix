package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.marketplace.*;
import com.eramix.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping("/listings")
    public ResponseEntity<ApiResponse<ListingResponse>> createListing(@RequestBody CreateListingRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                marketplaceService.createListing(currentUserId(), req)));
    }

    @GetMapping("/listings")
    public ResponseEntity<ApiResponse<List<ListingResponse>>> getListings(
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                marketplaceService.getListings(city, page, size)));
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<ListingResponse>> getListing(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                marketplaceService.getListing(id)));
    }

    @GetMapping("/my-listings")
    public ResponseEntity<ApiResponse<List<ListingResponse>>> getMyListings() {
        return ResponseEntity.ok(ApiResponse.ok(
                marketplaceService.getMyListings(currentUserId())));
    }

    @DeleteMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateListing(@PathVariable Long id) {
        marketplaceService.deactivateListing(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/escrow")
    public ResponseEntity<ApiResponse<EscrowResponse>> initiateEscrow(@RequestBody InitiateEscrowRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                marketplaceService.initiateEscrow(currentUserId(), req)));
    }

    @PutMapping("/escrow/{id}/confirm")
    public ResponseEntity<ApiResponse<EscrowResponse>> confirmMeet(
            @PathVariable Long id, @RequestParam String role) {
        return ResponseEntity.ok(ApiResponse.ok(
                marketplaceService.confirmMeet(id, currentUserId(), role)));
    }

    @PutMapping("/escrow/{id}/complete")
    public ResponseEntity<ApiResponse<EscrowResponse>> completeEscrow(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                marketplaceService.completeEscrow(id)));
    }

    @GetMapping("/escrow")
    public ResponseEntity<ApiResponse<List<EscrowResponse>>> getMyEscrows() {
        return ResponseEntity.ok(ApiResponse.ok(
                marketplaceService.getMyEscrows(currentUserId())));
    }
}
