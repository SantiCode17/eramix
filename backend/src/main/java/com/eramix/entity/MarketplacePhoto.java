package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Foto de un artículo del marketplace circular.
 */
@Entity
@Table(name = "marketplace_photo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MarketplacePhoto extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private MarketplaceListing listing;

    @Column(name = "photo_url", nullable = false, length = 512)
    private String photoUrl;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;
}
