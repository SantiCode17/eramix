package com.eramix.entity;

import com.eramix.entity.enums.PlaceCategory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "place")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Place extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PlaceCategory category;

    @Column(length = 300)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    private Double latitude;
    private Double longitude;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "user_id", nullable = false)
    private Long userId;
}
