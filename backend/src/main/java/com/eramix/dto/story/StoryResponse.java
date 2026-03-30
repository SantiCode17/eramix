package com.eramix.dto.story;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoryResponse {

    private Long id;
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private String userProfilePhotoUrl;
    private String mediaUrl;
    private String caption;
    private Instant createdAt;
    private Instant expiresAt;
    private Long viewCount;
    private Boolean viewedByCurrentUser;
}
