package com.eramix.dto.location;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveLocationResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String profilePhotoUrl;
    private Double latitude;
    private Double longitude;
    private Instant expiresAt;
    private Instant updatedAt;
    private boolean active;
}
