package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.ticketing.*;
import com.eramix.service.TicketingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketingController {

    private final TicketingService ticketingService;

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping("/listings")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getListings() {
        return ResponseEntity.ok(ApiResponse.ok(
                ticketingService.getListings()));
    }

    @PostMapping("/purchase/{ticketListingId}")
    public ResponseEntity<ApiResponse<TicketResponse>> purchaseTicket(@PathVariable Long ticketListingId) {
        return ResponseEntity.ok(ApiResponse.ok(
                ticketingService.purchaseTicket(currentUserId(), ticketListingId)));
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyTickets() {
        return ResponseEntity.ok(ApiResponse.ok(
                ticketingService.getMyTickets(currentUserId())));
    }

    @GetMapping("/qr/{ticketUuid}")
    public ResponseEntity<ApiResponse<String>> generateQr(@PathVariable String ticketUuid) {
        return ResponseEntity.ok(ApiResponse.ok(
                ticketingService.generateQrPayload(ticketUuid)));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<ValidateTicketResponse>> validateTicket(
            @RequestBody ValidateTicketRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                ticketingService.validateTicket(req)));
    }
}
