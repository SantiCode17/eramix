package com.eramix.dto.wellbeing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckinRequest {
    private Integer moodScore; // 1-10
    private String journalEntry;
    private Integer sleepHours;
    private Integer socialInteractions;
}
