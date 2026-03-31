package com.eramix.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data @Builder @AllArgsConstructor
public class SubmissionResponse {
    private Long id;
    private Long challengeId;
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private String userProfilePhotoUrl;
    private String photoUrl;
    private String caption;
    private int voteCount;
    private boolean votedByMe;
    private String createdAt;
}
