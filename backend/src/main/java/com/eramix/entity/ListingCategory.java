package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Categoría de artículos del marketplace circular.
 */
@Entity
@Table(name = "listing_category")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ListingCategory extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 50)
    private String icon;
}
