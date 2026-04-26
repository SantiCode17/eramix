package com.eramix.controller;

import com.eramix.dto.ApiResponse;
import com.eramix.dto.wellbeing.*;
import com.eramix.entity.EmergencyContact;
import com.eramix.service.WellbeingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wellbeing")
@RequiredArgsConstructor
public class WellbeingController {

    private final WellbeingService wellbeingService;

    private Long currentUserId() {
        return (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping("/checkin")
    public ResponseEntity<ApiResponse<CheckinResponse>> checkin(@RequestBody CheckinRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                wellbeingService.createCheckin(currentUserId(), req)));
    }

    @GetMapping("/checkins")
    public ResponseEntity<ApiResponse<List<CheckinResponse>>> getCheckins() {
        return ResponseEntity.ok(ApiResponse.ok(
                wellbeingService.getCheckins(currentUserId())));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<WellbeingSummaryResponse>> getSummary(
            @RequestParam(required = false) String countryCode) {
        return ResponseEntity.ok(ApiResponse.ok(
                wellbeingService.getSummary(currentUserId(), countryCode)));
    }

    @PostMapping("/sos")
    public ResponseEntity<ApiResponse<Void>> activateSOS(@RequestBody SOSActivateRequest req) {
        wellbeingService.activateSOS(currentUserId(), req);
        return ResponseEntity.ok(ApiResponse.ok("SOS activated", null));
    }

    @PostMapping("/emergency-contacts")
    public ResponseEntity<ApiResponse<EmergencyContact>> addContact(@RequestBody EmergencyContactRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                wellbeingService.addEmergencyContact(currentUserId(), req)));
    }

    @GetMapping("/emergency-contacts")
    public ResponseEntity<ApiResponse<List<EmergencyContact>>> getContacts() {
        return ResponseEntity.ok(ApiResponse.ok(
                wellbeingService.getEmergencyContacts(currentUserId())));
    }

    @DeleteMapping("/emergency-contacts/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable Long id) {
        wellbeingService.deleteEmergencyContact(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
