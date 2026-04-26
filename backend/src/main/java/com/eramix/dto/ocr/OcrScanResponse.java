package com.eramix.dto.ocr;

import com.eramix.entity.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcrScanResponse {
    private String scanUuid;
    private DocumentType documentType;
    private Double confidence;
    private String rawText;
    private List<ExtractedField> extractedFields;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExtractedField {
        private String fieldName;
        private String fieldValue;
        private Double confidence;
    }
}
