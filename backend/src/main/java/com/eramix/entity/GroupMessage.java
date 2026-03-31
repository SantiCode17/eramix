package com.eramix.entity;

import com.eramix.entity.enums.MessageType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "group_message")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private ChatGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MessageType type = MessageType.TEXT;

    @Column(name = "media_url", length = 512)
    private String mediaUrl;
}
