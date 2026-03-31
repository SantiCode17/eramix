package com.eramix.entity;

import com.eramix.entity.enums.HousingPostType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "housing_post")
@Getter @Setter @NoArgsConstructor
public class HousingPost extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 300)
    private String address;

    @Column(name = "monthly_rent", nullable = false)
    private BigDecimal monthlyRent;

    @Column(nullable = false, length = 3)
    private String currency = "EUR";

    @Column(name = "available_from", nullable = false)
    private LocalDate availableFrom;

    @Column(name = "available_until")
    private LocalDate availableUntil;

    @Column(name = "rooms_available", nullable = false)
    private int roomsAvailable = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", nullable = false, length = 20)
    private HousingPostType postType = HousingPostType.OFFER;

    @Column(name = "photo_url", length = 512)
    private String photoUrl;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
