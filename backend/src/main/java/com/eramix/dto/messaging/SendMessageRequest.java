package com.eramix.dto.messaging;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    @NotNull(message = "El ID de conversación es obligatorio")
    private Long conversationId;

    @NotBlank(message = "El contenido es obligatorio")
    @Size(max = 2000, message = "El mensaje no puede superar 2000 caracteres")
    private String content;

    @Builder.Default
    private String type = "TEXT";

    private String mediaUrl;
}
