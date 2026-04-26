package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * Activación del protocolo SOS por el usuario.
 */
@Entity
@Table(name = "sos_activation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SOSActivation extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "activation_type", nullable = false, length = 30)
    private String activationType;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "contacts_notified", nullable = false)
    @Builder.Default
    private Integer contactsNotified = 0;

    @Column(name = "country_code", length = 3)
    private String countryCode;
}
