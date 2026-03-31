package com.eramix.entity;

import com.eramix.entity.enums.AiRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_message")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ai_conversation_id", nullable = false)
    private AiConversation aiConversation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AiRole role;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
}
