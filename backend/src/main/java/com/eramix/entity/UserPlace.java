package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_place")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserPlace extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String category = "OTHER";

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String priority = "MEDIUM";

    @Column(nullable = false)
    @Builder.Default
    private Boolean visited = false;

    private Integer rating;

    @Column(name = "maps_url", length = 500)
    private String mapsUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "target_date")
    private LocalDate targetDate;
}
