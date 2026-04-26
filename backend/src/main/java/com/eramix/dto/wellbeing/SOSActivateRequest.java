package com.eramix.dto.wellbeing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SOSActivateRequest {
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String countryCode;
}
