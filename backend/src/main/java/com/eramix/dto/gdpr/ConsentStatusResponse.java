package com.eramix.dto.gdpr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsentStatusResponse {
    private boolean locationTracking;
    private boolean wellbeingAnalysis;
    private boolean marketingNotifications;
    private boolean analyticsAnonymized;
    private boolean thirdPartyEwpSync;
    private String lastUpdated;
}
