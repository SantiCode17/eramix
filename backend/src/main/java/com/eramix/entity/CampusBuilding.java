package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * Edificio del campus universitario con coordenadas GPS para AR.
 */
@Entity
@Table(name = "campus_building")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CampusBuilding extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    private University university;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "building_type", nullable = false, length = 50)
    @Builder.Default
    private String buildingType = "ACADEMIC";

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal altitude = BigDecimal.ZERO;

    @Column(name = "floor_count")
    @Builder.Default
    private Integer floorCount = 1;

    @Column(name = "opening_hours", length = 255)
    private String openingHours;

    @Column(columnDefinition = "JSON")
    private String services;

    @Column(name = "model_url", length = 512)
    private String modelUrl;

    @Column(name = "image_url", length = 512)
    private String imageUrl;
}
