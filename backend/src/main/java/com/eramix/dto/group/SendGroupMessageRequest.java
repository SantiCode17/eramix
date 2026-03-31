package com.eramix.dto.group;

import com.eramix.entity.enums.MessageType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendGroupMessageRequest {

    @NotNull
    private Long groupId;

    private String content;

    @Builder.Default
    private MessageType type = MessageType.TEXT;

    private String mediaUrl;
}
