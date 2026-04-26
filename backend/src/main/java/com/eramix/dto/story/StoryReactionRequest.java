package com.eramix.dto.story;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StoryReactionRequest {
    @NotBlank
    @Size(max = 10)
    private String emoji;
}
