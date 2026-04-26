package com.eramix.entity;

import com.eramix.entity.enums.ConsentType;
import jakarta.persistence.*;
import lombok.*;

/**
 * Registro inmutable de cambios en los consentimientos GDPR del usuario.
 * Nunca se actualiza ni se elimina (obligación legal de demostración de cumplimiento).
 */
@Entity
@Table(name = "consent_audit_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConsentAuditLog extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_type", nullable = false, length = 50)
    private ConsentType consentType;

    @Column(nullable = false)
    private Boolean granted;

    @Column(name = "ip_address", length = 255)
    private String ipAddress;

    @Column(name = "user_agent", length = 512)
    private String userAgent;
}
