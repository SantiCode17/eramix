package com.eramix.dto.story;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoryReactionResponse {
    private Long storyId;
    private Long userId;
    private String emoji;
    private long totalReactions;
}
