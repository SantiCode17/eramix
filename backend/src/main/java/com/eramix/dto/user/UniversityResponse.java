package com.eramix.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversityResponse {

    private Long id;
    private String name;
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
}
