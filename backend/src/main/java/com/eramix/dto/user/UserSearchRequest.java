package com.eramix.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchRequest {

    private String destinationCity;
    private String destinationCountry;
    private Long universityId;

    /** Radio en km para búsqueda por proximidad (Haversine) */
    private Double radiusKm;
    private Double latitude;
    private Double longitude;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 20;
}
