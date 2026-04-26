package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Recurso de emergencia por país: líneas de crisis, teléfonos de emergencia.
 */
@Entity
@Table(name = "emergency_resource")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmergencyResource extends BaseEntity {

    @Column(name = "country_code", nullable = false, length = 3)
    private String countryCode;

    @Column(name = "country_name", nullable = false, length = 100)
    private String countryName;

    @Column(name = "emergency_number", nullable = false, length = 20)
    private String emergencyNumber;

    @Column(name = "mental_health_line", length = 20)
    private String mentalHealthLine;

    @Column(name = "organization_name", length = 255)
    private String organizationName;

    @Column(length = 255)
    private String languages;

    @Column(name = "info_url", length = 512)
    private String infoUrl;
}
