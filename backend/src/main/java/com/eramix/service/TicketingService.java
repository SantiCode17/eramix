package com.eramix.service;

import com.eramix.dto.ticketing.*;
import com.eramix.entity.*;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketingService {

    private final TicketListingRepository ticketListingRepo;
    private final CryptographicTicketRepository ticketRepo;
    private final EventRepository eventRepo;

    private static final int TOTP_PERIOD = 30;
    private static final int TOTP_DIGITS = 6;
    private final SecureRandom secureRandom = new SecureRandom();

    // ── Listings ──────────────────────────────────────────────────────

    public List<TicketResponse> getListings() {
        return ticketListingRepo.findAll()
                .stream().map(this::toListingResponse).toList();
    }

    // ── Purchase ─────────────────────────────────────────────────────────

    @Transactional
    public TicketResponse purchaseTicket(Long buyerId, Long ticketListingId) {
        TicketListing listing = ticketListingRepo.findById(ticketListingId)
                .orElseThrow(() -> new RuntimeException("Ticket listing not found"));

        if (listing.getRemainingTickets() <= 0) {
            throw new RuntimeException("Event is sold out");
        }

        // Generate TOTP secret
        byte[] secretBytes = new byte[20];
        secureRandom.nextBytes(secretBytes);
        String totpSecret = Base64.getEncoder().encodeToString(secretBytes);

        String ticketUuid = UUID.randomUUID().toString();

        CryptographicTicket ticket = CryptographicTicket.builder()
                .ticketUuid(ticketUuid)
                .ticketListing(listing)
                .buyerId(buyerId)
                .totpSecretEncrypted(totpSecret)
                .totpSecretHash(UUID.randomUUID().toString())
                .purchaseDate(Instant.now())
                .isRedeemed(false)
                .build();

        ticket = ticketRepo.save(ticket);

        // Decrement remaining tickets
        listing.setRemainingTickets(listing.getRemainingTickets() - 1);
        ticketListingRepo.save(listing);

        return toTicketResponse(ticket);
    }

    // ── My tickets ───────────────────────────────────────────────────────

    public List<TicketResponse> getMyTickets(Long userId) {
        return ticketRepo.findByBuyerIdOrderByPurchaseDateDesc(userId)
                .stream().map(this::toTicketResponse).toList();
    }

    // ── Generate dynamic QR ─────────────────────────────────────────────

    public String generateQrPayload(String ticketUuid) {
        CryptographicTicket ticket = ticketRepo.findByTicketUuid(ticketUuid)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getIsRedeemed()) {
            throw new RuntimeException("Ticket already redeemed");
        }

        String totp = generateTOTP(ticket.getTotpSecretEncrypted());
        return ticketUuid + "|" + totp + "|" + Instant.now().getEpochSecond();
    }

    // ── Validate at door ─────────────────────────────────────────────────

    @Transactional
    public ValidateTicketResponse validateTicket(ValidateTicketRequest req) {
        CryptographicTicket ticket = ticketRepo.findByTicketUuid(req.getTicketUuid())
                .orElse(null);

        if (ticket == null) {
            return ValidateTicketResponse.builder()
                    .valid(false).message("Ticket not found").build();
        }

        if (ticket.getIsRedeemed()) {
            return ValidateTicketResponse.builder()
                    .valid(false).message("Ticket already redeemed")
                    .ticketUuid(ticket.getTicketUuid()).build();
        }

        // Validate TOTP – check current and previous window
        String expectedCurrent = generateTOTP(ticket.getTotpSecretEncrypted());
        String expectedPrev = generateTOTPForTime(ticket.getTotpSecretEncrypted(),
                Instant.now().getEpochSecond() - TOTP_PERIOD);

        if (!req.getTotpCode().equals(expectedCurrent) && !req.getTotpCode().equals(expectedPrev)) {
            return ValidateTicketResponse.builder()
                    .valid(false).message("Invalid TOTP code – ticket may be counterfeit")
                    .ticketUuid(ticket.getTicketUuid()).build();
        }

        // Mark as redeemed
        ticket.setIsRedeemed(true);
        ticket.setRedeemedAt(Instant.now());
        ticketRepo.save(ticket);

        String holderName = "";
        String eventTitle = "";
        try {
            var event = eventRepo.findById(ticket.getTicketListing().getEventId()).orElse(null);
            if (event != null) eventTitle = event.getTitle();
        } catch (Exception ignored) {}

        return ValidateTicketResponse.builder()
                .valid(true)
                .message("Ticket validated successfully")
                .ticketUuid(ticket.getTicketUuid())
                .holderName(holderName)
                .eventTitle(eventTitle)
                .build();
    }

    // ── TOTP implementation ──────────────────────────────────────────────

    private String generateTOTP(String base64Secret) {
        return generateTOTPForTime(base64Secret, Instant.now().getEpochSecond());
    }

    private String generateTOTPForTime(String base64Secret, long timeSeconds) {
        try {
            byte[] key = Base64.getDecoder().decode(base64Secret);
            long counter = timeSeconds / TOTP_PERIOD;

            byte[] data = ByteBuffer.allocate(8).putLong(counter).array();
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(data);

            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                       | ((hash[offset + 1] & 0xFF) << 16)
                       | ((hash[offset + 2] & 0xFF) << 8)
                       | (hash[offset + 3] & 0xFF);

            int otp = binary % (int) Math.pow(10, TOTP_DIGITS);
            return String.format("%0" + TOTP_DIGITS + "d", otp);
        } catch (Exception e) {
            throw new RuntimeException("TOTP generation failed", e);
        }
    }

    // ── Mappers ──────────────────────────────────────────────────────────

    private TicketResponse toTicketResponse(CryptographicTicket t) {
        String eventTitle = "";
        try {
            if (t.getTicketListing() != null && t.getTicketListing().getEventId() != null) {
                var event = eventRepo.findById(t.getTicketListing().getEventId()).orElse(null);
                if (event != null) eventTitle = event.getTitle();
            }
        } catch (Exception ignored) {}

        String qrPayload = null;
        if (!t.getIsRedeemed()) {
            try {
                qrPayload = generateQrPayload(t.getTicketUuid());
            } catch (Exception ignored) {}
        }

        return TicketResponse.builder()
                .id(t.getId())
                .ticketUuid(t.getTicketUuid())
                .eventId(t.getTicketListing() != null ? t.getTicketListing().getEventId() : null)
                .eventTitle(eventTitle)
                .qrPayload(qrPayload)
                .isRedeemed(t.getIsRedeemed())
                .purchaseDate(t.getPurchaseDate() != null ? t.getPurchaseDate().toString() : null)
                .redeemedAt(t.getRedeemedAt() != null ? t.getRedeemedAt().toString() : null)
                .build();
    }

    private TicketResponse toListingResponse(TicketListing listing) {
        String eventTitle = "";
        try {
            if (listing.getEventId() != null) {
                var event = eventRepo.findById(listing.getEventId()).orElse(null);
                if (event != null) eventTitle = event.getTitle();
            }
        } catch (Exception ignored) {}

        return TicketResponse.builder()
                .id(listing.getId())
                .ticketUuid(null)
                .eventId(listing.getEventId())
                .eventTitle(eventTitle)
                .qrPayload(null)
                .isRedeemed(false)
                .purchaseDate(null)
                .redeemedAt(null)
                .build();
    }
}
