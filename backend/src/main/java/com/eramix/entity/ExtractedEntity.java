package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entidad extraída del texto OCR: importe, fecha, nombre de establecimiento, etc.
 * Cada OpticalRecord puede tener múltiples entidades extraídas.
 */
@Entity
@Table(name = "extracted_entity")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExtractedEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "optical_record_id", nullable = false)
    private OpticalRecord opticalRecord;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;

    @Column(name = "field_value", length = 500)
    private String fieldValue;

    @Column
    @Builder.Default
    private Double confidence = 0.0;

    @Column(name = "needs_review", nullable = false)
    @Builder.Default
    private Boolean needsReview = false;

    @Column(name = "bbox_x")
    private Integer bboxX;

    @Column(name = "bbox_y")
    private Integer bboxY;

    @Column(name = "bbox_width")
    private Integer bboxWidth;

    @Column(name = "bbox_height")
    private Integer bboxHeight;
}
