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
public class EventResponse {

    private Long id;
    private Long creatorId;
    private String creatorFirstName;
    private String creatorLastName;
    private String creatorProfilePhotoUrl;
    private String title;
    private String description;
    private String category;
    private String location;
    private Double latitude;
    private Double longitude;
    private Instant startDatetime;
    private Instant endDatetime;
    private Integer maxParticipants;
    private Boolean isPublic;
    private Long participantCount;
    private String currentUserStatus;
    private Instant createdAt;
    private String coverImageUrl;
}
