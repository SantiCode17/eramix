package com.eramix.dto.exchange;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.Instant;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ScheduleSessionRequest {

    @NotNull private Long requestId;
    @NotNull private Instant scheduledAt;
    private Integer durationMinutes;
    private String notes;
}
