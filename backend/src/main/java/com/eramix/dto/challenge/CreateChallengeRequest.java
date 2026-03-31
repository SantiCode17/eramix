package com.eramix.dto.challenge;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateChallengeRequest {
    @NotBlank private String title;
    @NotBlank private String description;
    private String emoji = "📸";
    @NotNull private String startDate;
    @NotNull private String endDate;
}
