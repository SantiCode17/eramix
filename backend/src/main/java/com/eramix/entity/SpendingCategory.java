package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Categoría de gasto predefinida para el módulo financiero.
 */
@Entity
@Table(name = "spending_category")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SpendingCategory extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(length = 50)
    private String icon;

    @Column(length = 7)
    private String color;
}
