package com.eramix.dto.wellbeing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyContactRequest {
    private String contactName;
    private String contactPhone;
    private String relationship;
    private boolean isPrimary;
}
