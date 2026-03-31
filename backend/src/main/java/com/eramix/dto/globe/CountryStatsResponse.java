package com.eramix.dto.globe;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CountryStatsResponse {
    private String country;
    private long studentCount;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private List<UniversityInfo> universities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UniversityInfo {
        private Long id;
        private String name;
        private String city;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private long studentCount;
    }
}
