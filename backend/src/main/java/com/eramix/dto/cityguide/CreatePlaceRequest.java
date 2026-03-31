package com.eramix.dto.cityguide;

import com.eramix.entity.enums.PlaceCategory;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreatePlaceRequest {
    private String name;
    private String description;
    private PlaceCategory category;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
}
