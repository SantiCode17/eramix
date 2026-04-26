package com.eramix.entity;

import com.eramix.entity.enums.DocumentType;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Registro de un escaneo OCR. Almacena la imagen original,
 * el texto extraído, el tipo de documento clasificado y
 * las entidades extraídas como hijos.
 */
@Entity
@Table(name = "optical_record")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OpticalRecord extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "scan_uuid", nullable = false, unique = true, length = 36)
    private String scanUuid;

    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "raw_text", columnDefinition = "TEXT")
    private String rawText;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 30)
    @Builder.Default
    private DocumentType documentType = DocumentType.UNKNOWN;

    @Column(name = "confidence_score")
    @Builder.Default
    private Double confidenceScore = 0.0;

    @Column(name = "language_detected", length = 10)
    private String languageDetected;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PROCESSING";

    @Column(name = "processed_at")
    private Instant processedAt;

    @OneToMany(mappedBy = "opticalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExtractedEntity> extractedEntities = new ArrayList<>();
}
