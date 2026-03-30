package com.eramix.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyUserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String profilePhotoUrl;
    private String destinationCity;
    private String destinationCountry;
    private Double distanceKm;
}
