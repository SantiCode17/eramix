package com.eramix.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private LocalDateTime locationUpdatedAt;

    private Boolean isActive;
    private Boolean isVerified;
    private LocalDateTime lastSeen;
    private LocalDateTime createdAt;

    private List<InterestSummary> interests;
    private List<UserLanguageSummary> languages;
    private List<UserPhotoResponse> photos;

    private Long friendCount;
    private Long eventCount;

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
