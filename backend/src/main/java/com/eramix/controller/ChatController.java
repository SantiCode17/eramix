package com.eramix.controller;

import com.eramix.dto.messaging.MessageResponse;
import com.eramix.dto.messaging.SendMessageRequest;
import com.eramix.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

/**
 * Controlador WebSocket STOMP para mensajería en tiempo real.
 *
 * Flujo:
 * 1. Cliente envía a /app/chat.sendMessage
 * 2. Se persiste el mensaje
 * 3. Se envía al destinatario via /user/{userId}/queue/messages
 * 4. Se confirma al remitente via /user/{senderId}/queue/messages
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload SendMessageRequest request,
                            SimpMessageHeaderAccessor headerAccessor) {

        Long senderId = extractUserId(headerAccessor);
        log.debug("Mensaje recibido de userId={} en conversación={}", senderId, request.getConversationId());

        // 1. Persistir mensaje y obtener respuesta con ID asignado
        MessageResponse saved = chatService.saveMessage(senderId, request);

        // 2. Obtener destinatario
        Long recipientId = chatService.getRecipientId(request.getConversationId(), senderId);

        // 3. Enviar al destinatario
        messagingTemplate.convertAndSendToUser(
                String.valueOf(recipientId),
                "/queue/messages",
                saved
        );

        // 4. Confirmar al remitente (para sincronizar el ID del mensaje)
        messagingTemplate.convertAndSendToUser(
                String.valueOf(senderId),
                "/queue/messages",
                saved
        );

        log.debug("Mensaje id={} enviado: {} → {}", saved.getId(), senderId, recipientId);
    }

    private Long extractUserId(SimpMessageHeaderAccessor accessor) {
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            return (Long) auth.getPrincipal();
        }
        throw new RuntimeException("No se pudo extraer el userId de la sesión WebSocket");
    }
}
