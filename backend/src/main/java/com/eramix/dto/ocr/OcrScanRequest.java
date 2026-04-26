package com.eramix.dto.ocr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcrScanRequest {
    private String imageBase64;
    private String mimeType;
    private String languageHint;
}
