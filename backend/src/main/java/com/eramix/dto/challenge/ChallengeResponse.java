package com.eramix.dto.challenge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data @Builder @AllArgsConstructor
public class ChallengeResponse {
    private Long id;
    private String title;
    private String description;
    private String emoji;
    private String startDate;
    private String endDate;
    private boolean active;
    private String creatorFirstName;
    private String creatorLastName;
    private int submissionCount;
}
