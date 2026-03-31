package com.eramix.controller;

import com.eramix.dto.group.GroupMessageResponse;
import com.eramix.dto.group.SendGroupMessageRequest;
import com.eramix.dto.messaging.MessageResponse;
import com.eramix.dto.messaging.SendMessageRequest;
import com.eramix.service.ChatService;
import com.eramix.service.GroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * Controlador WebSocket STOMP para mensajería en tiempo real.
 *
 * Flujo DM:
 * 1. Cliente envía a /app/chat.sendMessage
 * 2. Se persiste el mensaje
 * 3. Se envía al destinatario via /user/{userId}/queue/messages
 * 4. Se confirma al remitente via /user/{senderId}/queue/messages
 *
 * Flujo Grupo:
 * 1. Cliente envía a /app/group.sendMessage
 * 2. Se persiste el mensaje
 * 3. Se broadcast a /topic/group/{groupId}
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final GroupService groupService;
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

    /**
     * Indicador de escritura: /app/chat.typing
     * Reenvía el evento al otro participante de la conversación.
     */
    @MessageMapping("/chat.typing")
    public void typing(@Payload java.util.Map<String, Object> payload,
                       SimpMessageHeaderAccessor headerAccessor) {

        Long senderId = extractUserId(headerAccessor);
        Long conversationId = ((Number) payload.get("conversationId")).longValue();
        Boolean typing = (Boolean) payload.get("typing");

        Long recipientId = chatService.getRecipientId(conversationId, senderId);

        messagingTemplate.convertAndSendToUser(
                String.valueOf(recipientId),
                "/queue/typing",
                java.util.Map.of(
                        "conversationId", conversationId,
                        "userId", senderId,
                        "typing", typing
                )
        );
    }

    // ─── GROUP MESSAGING ──────────────────────────────────

    /**
     * Mensaje de grupo: /app/group.sendMessage
     * Broadcast a /topic/group/{groupId} para todos los miembros suscritos.
     * También envía a /user/{userId}/queue/group-messages para miembros offline.
     */
    @MessageMapping("/group.sendMessage")
    public void sendGroupMessage(@Payload SendGroupMessageRequest request,
                                  SimpMessageHeaderAccessor headerAccessor) {

        Long senderId = extractUserId(headerAccessor);
        log.debug("Mensaje de grupo recibido de userId={} en grupo={}", senderId, request.getGroupId());

        // 1. Persistir mensaje
        GroupMessageResponse saved = groupService.sendGroupMessage(senderId, request);

        // 2. Broadcast al topic del grupo
        messagingTemplate.convertAndSend(
                "/topic/group/" + request.getGroupId(),
                saved
        );

        // 3. Enviar también como notificación a cada miembro (para los que no están suscritos al topic)
        List<Long> memberIds = groupService.getGroupMemberIds(request.getGroupId());
        for (Long memberId : memberIds) {
            if (!memberId.equals(senderId)) {
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(memberId),
                        "/queue/group-messages",
                        saved
                );
            }
        }

        log.debug("Mensaje de grupo id={} enviado al grupo={}", saved.getId(), request.getGroupId());
    }

    /**
     * Indicador de escritura en grupo: /app/group.typing
     * Broadcast a /topic/group/{groupId}/typing
     */
    @MessageMapping("/group.typing")
    public void groupTyping(@Payload java.util.Map<String, Object> payload,
                            SimpMessageHeaderAccessor headerAccessor) {

        Long senderId = extractUserId(headerAccessor);
        Long groupId = ((Number) payload.get("groupId")).longValue();
        Boolean typing = (Boolean) payload.get("typing");

        messagingTemplate.convertAndSend(
                "/topic/group/" + groupId + "/typing",
                java.util.Map.of(
                        "groupId", groupId,
                        "userId", senderId,
                        "typing", typing
                )
        );
    }

    private Long extractUserId(SimpMessageHeaderAccessor accessor) {
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            return (Long) auth.getPrincipal();
        }
        throw new RuntimeException("No se pudo extraer el userId de la sesión WebSocket");
    }
}
