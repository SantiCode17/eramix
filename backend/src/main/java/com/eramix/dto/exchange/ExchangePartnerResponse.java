package com.eramix.dto.exchange;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExchangePartnerResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String profilePhotoUrl;
    private String destinationCity;
    private Double averageRating;
    private Integer sessionsCompleted;
    private List<LanguageInfo> teaches;
    private List<LanguageInfo> learns;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LanguageInfo {
        private Long languageId;
        private String languageName;
        private String proficiencyLevel;
    }
}
