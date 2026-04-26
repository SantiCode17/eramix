package com.eramix.dto.ewp;

import com.eramix.entity.enums.LearningAgreementState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningAgreementResponse {
    private Long id;
    private String olaId;
    private LearningAgreementState state;
    private String homeInstitution;
    private String hostInstitution;
    private String signedByStudent;
    private String signedByHome;
    private String signedByHost;
    private List<CreditMappingItem> credits;
    private String createdAt;
    private String updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreditMappingItem {
        private Long id;
        private String hostCourseCode;
        private String hostCourseName;
        private Double hostEcts;
        private String homeCourseCode;
        private String homeCourseName;
        private Double homeEcts;
        private String equivalenceStatus;
    }
}
