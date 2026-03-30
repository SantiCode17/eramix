package com.eramix.entity;

import com.eramix.entity.enums.EventParticipantStatus;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "event_participant")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(EventParticipant.EventParticipantId.class)
public class EventParticipant {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EventParticipantStatus status = EventParticipantStatus.GOING;

    @Column(name = "joined_at", nullable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventParticipantId implements Serializable {
        private Long event;
        private Long user;
    }
}
