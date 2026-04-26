package com.eramix.entity.enums;

/**
 * Estado del Learning Agreement en la red EWP.
 */
public enum LearningAgreementState {
    DRAFT,
    SENT_FOR_SIGNATURE,
    SIGNED_HOME,
    SIGNED_HOST,
    FULLY_SIGNED,
    REJECTED,
    AMENDMENT_PENDING
}
