package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_conversation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiConversation extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    @Builder.Default
    private String title = "Nueva conversación";

    @OneToMany(mappedBy = "aiConversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AiMessage> messages = new ArrayList<>();
}
