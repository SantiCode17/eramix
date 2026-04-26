package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * Metadato de documento ingestado en ChromaDB para RAG.
 * Almacena título, fuente, idioma y número de chunks generados.
 */
@Entity
@Table(name = "vector_document")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VectorDocument extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "source_url", length = 512)
    private String sourceUrl;

    @Column(name = "document_type", nullable = false, length = 50)
    @Builder.Default
    private String documentType = "FAQ";

    @Column(name = "language_code", nullable = false, length = 10)
    @Builder.Default
    private String languageCode = "en";

    @Column(name = "chunk_count", nullable = false)
    @Builder.Default
    private Integer chunkCount = 0;

    @Column(name = "file_hash", length = 64)
    private String fileHash;

    @Column(name = "ingested_at")
    private Instant ingestedAt;
}
