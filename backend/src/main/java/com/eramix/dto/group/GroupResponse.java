package com.eramix.dto.group;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponse {

    private Long id;
    private String name;
    private String description;
    private String avatarUrl;
    private Long creatorId;
    private Integer maxMembers;
    private Integer memberCount;
    private Boolean isActive;
    private Instant createdAt;

    // Para la lista: último mensaje y no leídos
    private String lastMessage;
    private Instant lastMessageAt;
    private Long unreadCount;

    // Para el detalle
    private List<GroupMemberResponse> members;
}
