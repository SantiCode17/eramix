package com.eramix.dto.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {

    private Long id;
    private Long otherUserId;
    private String otherUserFirstName;
    private String otherUserLastName;
    private String otherUserProfilePhotoUrl;
    private Boolean otherUserOnline;
    private MessageResponse lastMessage;
    private Long unreadCount;
    private Instant lastMessageAt;
}
