package com.eramix.dto.social;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestResponse {

    private Long id;
    private Long senderId;
    private String senderFirstName;
    private String senderLastName;
    private String senderProfilePhotoUrl;
    private Long receiverId;
    private String receiverFirstName;
    private String receiverLastName;
    private String receiverProfilePhotoUrl;
    private String status;
    private LocalDateTime createdAt;
}
