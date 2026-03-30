package com.eramix.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipantResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String profilePhotoUrl;
    private String status;
    private Instant joinedAt;
}
