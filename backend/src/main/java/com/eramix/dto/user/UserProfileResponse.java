package com.eramix.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String profilePhotoUrl;
    private LocalDate dateOfBirth;
    private String bio;

    private UniversitySummary homeUniversity;
    private UniversitySummary hostUniversity;

    private String destinationCity;
    private String destinationCountry;
    private LocalDate mobilityStartDate;
    private LocalDate mobilityEndDate;

    private Double latitude;
    private Double longitude;
    private Instant locationUpdatedAt;

    private Boolean isActive;
    private Boolean isVerified;
    private Instant lastSeen;
    private Instant createdAt;

    private List<InterestSummary> interests;
    private List<UserLanguageSummary> languages;
    private List<UserPhotoResponse> photos;

    private Long friendCount;
    private Long eventCount;

    private String whyAmIHere;
    private String favoriteSong;
    private String favoriteFood;
    private String specialHobby;
    private String customPrompts;
    private String socialInstagram;
    private String socialTiktok;

    private Integer height;
    private String zodiac;
    private String profession;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UniversitySummary {
        private Long id;
        private String name;
        private String city;
        private String country;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterestSummary {
        private Long id;
        private String name;
        private String category;
        private String emoji;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserLanguageSummary {
        private Long id;
        private String code;
        private String name;
        private String proficiencyLevel;
    }
}
