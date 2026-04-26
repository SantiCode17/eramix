package com.eramix.dto.wellbeing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckinResponse {
    private Long id;
    private Integer moodScore;
    private String journalEntry;
    private Integer sleepHours;
    private Integer socialInteractions;
    private String createdAt;
}
