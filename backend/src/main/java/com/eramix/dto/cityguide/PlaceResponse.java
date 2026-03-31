package com.eramix.dto.cityguide;

import com.eramix.entity.enums.PlaceCategory;
import lombok.*;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlaceResponse {
    private Long id;
    private String name;
    private String description;
    private PlaceCategory category;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
    private Long userId;
    private Double averageRating;
    private Integer reviewCount;
    private Instant createdAt;
}
