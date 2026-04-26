package com.eramix.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmartMatchResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String profilePhotoUrl;
    private String destinationCity;
    private String destinationCountry;
    private String bio;
    private int compatibilityScore;
    private List<String> sharedInterests;
    private List<String> sharedLanguages;
}
