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
public class MessageResponse {

    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderFirstName;
    private String senderLastName;
    private String content;
    private String type;
    private String mediaUrl;
    private Double latitude;
    private Double longitude;
    private Boolean isRead;
    private Instant createdAt;
}
