package com.eramix.service;

import com.eramix.dto.messaging.ConversationResponse;
import com.eramix.dto.messaging.MessageResponse;
import com.eramix.dto.messaging.SendMessageRequest;
import com.eramix.entity.Conversation;
import com.eramix.entity.Message;
import com.eramix.entity.User;
import com.eramix.entity.enums.MessageType;
import com.eramix.entity.enums.NotificationType;
import com.eramix.exception.UserNotFoundException;
import com.eramix.repository.ConversationRepository;
import com.eramix.repository.MessageRepository;
import com.eramix.repository.UserRepository;
import com.eramix.websocket.WebSocketSessionManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final WebSocketSessionManager sessionManager;

    // ── Guardar mensaje ───────────────────────────────────

    @Transactional
    public MessageResponse saveMessage(Long senderId, SendMessageRequest request) {
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));

        // Verificar que el remitente es participante
        if (!isParticipant(conversation, senderId)) {
            throw new RuntimeException("No eres participante de esta conversación");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException(senderId));

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .type(MessageType.valueOf(request.getType()))
                .mediaUrl(request.getMediaUrl())
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        // Actualizar lastMessageAt de la conversación
        conversation.setLastMessageAt(Instant.now());
        conversationRepository.save(conversation);

        // Crear notificación para el destinatario
        Long receiverId = getOtherUserId(conversation, senderId);
        notificationService.send(
                receiverId,
                NotificationType.NEW_MESSAGE,
                "Nuevo mensaje de " + sender.getFirstName(),
                request.getContent().length() > 100
                        ? request.getContent().substring(0, 100) + "..."
                        : request.getContent(),
                String.valueOf(conversation.getId())
        );

        return toMessageResponse(message);
    }

    // ── Obtener conversaciones del usuario ─────────────────

    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(Long userId) {
        List<Conversation> conversations = conversationRepository.findAllByUserId(userId);

        return conversations.stream().map(conv -> {
            Long otherUserId = getOtherUserId(conv, userId);
            User otherUser = getOtherUser(conv, userId);
            long unread = messageRepository.countUnreadByConversation(conv.getId(), userId);

            // Último mensaje
            List<Message> latestMessages = messageRepository
                    .findByConversationLatest(conv.getId(), PageRequest.of(0, 1));
            MessageResponse lastMessage = latestMessages.isEmpty()
                    ? null
                    : toMessageResponse(latestMessages.get(0));

            return ConversationResponse.builder()
                    .id(conv.getId())
                    .otherUserId(otherUserId)
                    .otherUserFirstName(otherUser.getFirstName())
                    .otherUserLastName(otherUser.getLastName())
                    .otherUserProfilePhotoUrl(otherUser.getProfilePhotoUrl())
                    .otherUserOnline(sessionManager.isUserOnline(otherUserId))
                    .lastMessage(lastMessage)
                    .unreadCount(unread)
                    .lastMessageAt(conv.getLastMessageAt())
                    .build();
        }).toList();
    }

    // ── Obtener detalle de conversación ────────────────────

    @Transactional(readOnly = true)
    public ConversationResponse getConversation(Long conversationId, Long userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));

        if (!isParticipant(conv, userId)) {
            throw new RuntimeException("No eres participante de esta conversación");
        }

        Long otherUserId = getOtherUserId(conv, userId);
        User otherUser = getOtherUser(conv, userId);
        long unread = messageRepository.countUnreadByConversation(conv.getId(), userId);

        List<Message> latestMessages = messageRepository
                .findByConversationLatest(conv.getId(), PageRequest.of(0, 1));
        MessageResponse lastMessage = latestMessages.isEmpty()
                ? null
                : toMessageResponse(latestMessages.get(0));

        return ConversationResponse.builder()
                .id(conv.getId())
                .otherUserId(otherUserId)
                .otherUserFirstName(otherUser.getFirstName())
                .otherUserLastName(otherUser.getLastName())
                .otherUserProfilePhotoUrl(otherUser.getProfilePhotoUrl())
                .otherUserOnline(sessionManager.isUserOnline(otherUserId))
                .lastMessage(lastMessage)
                .unreadCount(unread)
                .lastMessageAt(conv.getLastMessageAt())
                .build();
    }

    // ── Mensajes con cursor-based pagination ──────────────

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long conversationId, Long userId, Long cursor, int size) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));

        if (!isParticipant(conv, userId)) {
            throw new RuntimeException("No eres participante de esta conversación");
        }

        List<Message> messages;
        PageRequest page = PageRequest.of(0, size);

        if (cursor == null) {
            // Primera carga: últimos N mensajes
            messages = messageRepository.findByConversationLatest(conversationId, page);
        } else {
            // Cargar anteriores al cursor
            messages = messageRepository.findByConversationCursor(conversationId, cursor, page);
        }

        // Devolver en orden cronológico (ASC) para el cliente
        List<MessageResponse> result = messages.stream()
                .map(this::toMessageResponse)
                .toList();
        return result.reversed();
    }

    // ── Marcar como leídos ────────────────────────────────

    @Transactional
    public int markAsRead(Long conversationId, Long userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));

        if (!isParticipant(conv, userId)) {
            throw new RuntimeException("No eres participante de esta conversación");
        }

        return messageRepository.markAsRead(conversationId, userId);
    }

    // ── Obtener el ID del destinatario ────────────────────

    public Long getRecipientId(Long conversationId, Long senderId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));
        return getOtherUserId(conv, senderId);
    }

    // ── Helpers ───────────────────────────────────────────

    private boolean isParticipant(Conversation conv, Long userId) {
        return conv.getUser1().getId().equals(userId) || conv.getUser2().getId().equals(userId);
    }

    private Long getOtherUserId(Conversation conv, Long userId) {
        return conv.getUser1().getId().equals(userId)
                ? conv.getUser2().getId()
                : conv.getUser1().getId();
    }

    private User getOtherUser(Conversation conv, Long userId) {
        return conv.getUser1().getId().equals(userId) ? conv.getUser2() : conv.getUser1();
    }

    private MessageResponse toMessageResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender().getId())
                .senderFirstName(m.getSender().getFirstName())
                .senderLastName(m.getSender().getLastName())
                .content(m.getContent())
                .type(m.getType().name())
                .mediaUrl(m.getMediaUrl())
                .isRead(m.getIsRead())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
