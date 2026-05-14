package com.eramix.dto.finance;

public record FinanceSettingsDto(
        Boolean enableNotifications,
        Boolean enableBudgetAlerts,
        Integer alertThreshold
) {}
