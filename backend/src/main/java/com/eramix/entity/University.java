package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "university")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class University extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 150)
    private String city;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;
}
