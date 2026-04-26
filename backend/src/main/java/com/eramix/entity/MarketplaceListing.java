package com.eramix.entity;

import com.eramix.entity.enums.ItemCondition;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Artículo publicado en el mercado circular estudiantil.
 */
@Entity
@Table(name = "marketplace_listing")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MarketplaceListing extends BaseEntity {

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ListingCategory category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "EUR";

    @Enumerated(EnumType.STRING)
    @Column(name = "item_condition", nullable = false, length = 30)
    @Builder.Default
    private ItemCondition itemCondition = ItemCondition.GOOD;

    @Column(length = 150)
    private String city;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "stripe_account_id", length = 100)
    private String stripeAccountId;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<MarketplacePhoto> photos = new ArrayList<>();
}
