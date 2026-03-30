package com.eramix.dto.story;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Long viewCount;
    private Boolean viewedByCurrentUser;
}
