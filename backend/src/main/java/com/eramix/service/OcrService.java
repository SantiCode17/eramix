package com.eramix.service;

import com.eramix.dto.ocr.*;
import com.eramix.entity.*;
import com.eramix.entity.enums.DocumentType;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OcrService {

    private final OpticalRecordRepository opticalRecordRepo;
    private final ExtractedEntityRepository extractedEntityRepo;

    /**
     * Process an image through OCR pipeline:
     * 1. Decode base64 image
     * 2. Run text extraction (Tess4j in production)
     * 3. Classify document type
     * 4. Extract structured entities
     */
    @Transactional
    public OcrScanResponse processImage(Long userId, OcrScanRequest req) {
        String scanUuid = UUID.randomUUID().toString();

        // Decode image
        byte[] imageBytes;
        try {
            imageBytes = Base64.getDecoder().decode(req.getImageBase64());
        } catch (Exception e) {
            throw new RuntimeException("Invalid base64 image");
        }

        // In production: use Tess4j for OCR
        // For now, create a placeholder response
        String rawText = performOcr(imageBytes, req.getLanguageHint());
        DocumentType docType = classifyDocument(rawText);
        List<OcrScanResponse.ExtractedField> fields = extractEntities(rawText, docType);

        // Persist
        OpticalRecord record = OpticalRecord.builder()
                .scanUuid(scanUuid)
                .userId(userId)
                .originalFilename("scan_" + scanUuid + ".jpg")
                .documentType(docType)
                .rawText(rawText)
                .confidenceScore(0.85)
                .status("COMPLETED")
                .build();
        record = opticalRecordRepo.save(record);

        // Persist extracted entities
        for (OcrScanResponse.ExtractedField field : fields) {
            ExtractedEntity entity = ExtractedEntity.builder()
                    .opticalRecord(record)
                    .fieldName(field.getFieldName())
                    .fieldValue(field.getFieldValue())
                    .confidence(field.getConfidence())
                    .build();
            extractedEntityRepo.save(entity);
        }

        return OcrScanResponse.builder()
                .scanUuid(scanUuid)
                .documentType(docType)
                .confidence(0.85)
                .rawText(rawText)
                .extractedFields(fields)
                .build();
    }

    public List<OcrScanResponse> getUserScans(Long userId) {
        return opticalRecordRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(r -> {
                    return OcrScanResponse.builder()
                        .scanUuid(r.getScanUuid())
                        .documentType(r.getDocumentType())
                        .confidence(r.getConfidenceScore())
                        .rawText(r.getRawText())
                        .extractedFields(extractedEntityRepo.findByOpticalRecordId(r.getId()).stream()
                                .map(e -> OcrScanResponse.ExtractedField.builder()
                                        .fieldName(e.getFieldName())
                                        .fieldValue(e.getFieldValue())
                                        .confidence(e.getConfidence())
                                        .build())
                                .toList())
                        .build();
                })
                .toList();
    }

    // ── OCR Engine (placeholder – replace with Tess4j) ───────────────────

    private String performOcr(byte[] imageBytes, String languageHint) {
        // Production: Use Tesseract via Tess4j
        log.info("OCR processing {} bytes, language hint: {}", imageBytes.length, languageHint);
        return "[OCR result placeholder – integrate Tess4j for production]";
    }

    private DocumentType classifyDocument(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("receipt") || lower.contains("total") || lower.contains("payment")) {
            return DocumentType.RECEIPT;
        } else if (lower.contains("contract") || lower.contains("lease") || lower.contains("tenant")) {
            return DocumentType.HOUSING_CONTRACT;
        } else if (lower.contains("ticket") || lower.contains("boarding") || lower.contains("departure")) {
            return DocumentType.TRANSPORT_TICKET;
        } else if (lower.contains("transcript") || lower.contains("grade") || lower.contains("ects")) {
            return DocumentType.ACADEMIC_FORM;
        }
        return DocumentType.UNKNOWN;
    }

    private List<OcrScanResponse.ExtractedField> extractEntities(String text, DocumentType type) {
        // Production: Use NER / regex patterns based on document type
        return List.of(
                OcrScanResponse.ExtractedField.builder()
                        .fieldName("document_type")
                        .fieldValue(type.name())
                        .confidence(0.85)
                        .build()
        );
    }
}
