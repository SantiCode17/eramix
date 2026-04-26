package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Contacto de emergencia personal configurado por el usuario.
 */
@Entity
@Table(name = "emergency_contact")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmergencyContact extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "phone_number", nullable = false, length = 30)
    private String phoneNumber;

    @Column(length = 50)
    private String relationship;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;
}
