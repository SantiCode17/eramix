package com.eramix.dto.group;

import com.eramix.entity.enums.MessageType;
import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMessageResponse {

    private Long id;
    private Long groupId;
    private Long senderId;
    private String senderFirstName;
    private String senderLastName;
    private String senderProfilePhotoUrl;
    private String content;
    private MessageType type;
    private String mediaUrl;
    private Instant createdAt;
}
