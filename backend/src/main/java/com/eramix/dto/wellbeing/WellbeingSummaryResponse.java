package com.eramix.dto.wellbeing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WellbeingSummaryResponse {
    private Double averageMood7d;
    private Double averageMood30d;
    private Long totalCheckins;
    private String trend; // IMPROVING, STABLE, DECLINING
    private List<DailyMood> moodHistory;
    private List<ResourceItem> emergencyResources;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyMood {
        private String date;
        private Integer moodScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResourceItem {
        private String name;
        private String phone;
        private String url;
        private String type;
    }
}
