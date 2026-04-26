package com.eramix.dto.gdpr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataExportResponse {
    private String exportId;
    private String status; // PROCESSING, READY, EXPIRED
    private String downloadUrl;
    private Map<String, Integer> dataCounts; // tableName -> rowCount
    private String requestedAt;
    private String completedAt;
}
