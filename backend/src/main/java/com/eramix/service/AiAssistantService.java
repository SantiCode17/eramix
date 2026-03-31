package com.eramix.service;

import com.eramix.dto.ai.*;
import com.eramix.entity.AiConversation;
import com.eramix.entity.AiMessage;
import com.eramix.entity.enums.AiRole;
import com.eramix.repository.AiConversationRepository;
import com.eramix.repository.AiMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private final AiConversationRepository conversationRepo;
    private final AiMessageRepository messageRepo;

    /**
     * Get all conversations for a user.
     */
    public List<AiConversationResponse> getConversations(Long userId) {
        return conversationRepo.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    /**
     * Get a single conversation with messages.
     */
    public AiConversationResponse getConversation(Long conversationId, Long userId) {
        AiConversation conv = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conv.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return toResponse(conv);
    }

    /**
     * Send a message to the AI assistant.
     * In a production environment, this would call an external AI API.
     * For now, it generates a helpful placeholder response.
     */
    @Transactional
    public AiConversationResponse chat(Long userId, AiChatRequest req) {
        AiConversation conv;
        if (req.getConversationId() != null) {
            conv = conversationRepo.findById(req.getConversationId())
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
            if (!conv.getUserId().equals(userId)) {
                throw new RuntimeException("Access denied");
            }
        } else {
            conv = AiConversation.builder()
                    .userId(userId)
                    .title(req.getMessage().length() > 50
                            ? req.getMessage().substring(0, 50) + "…"
                            : req.getMessage())
                    .build();
            conv = conversationRepo.save(conv);
        }

        // Save user message
        AiMessage userMsg = AiMessage.builder()
                .aiConversation(conv)
                .role(AiRole.USER)
                .content(req.getMessage())
                .build();
        messageRepo.save(userMsg);

        // Generate AI response (placeholder – replace with real AI call)
        String aiReply = generateResponse(req.getMessage());
        AiMessage aiMsg = AiMessage.builder()
                .aiConversation(conv)
                .role(AiRole.ASSISTANT)
                .content(aiReply)
                .build();
        messageRepo.save(aiMsg);

        return toResponse(conversationRepo.findById(conv.getId()).orElse(conv));
    }

    /**
     * Delete a conversation.
     */
    @Transactional
    public void deleteConversation(Long conversationId, Long userId) {
        AiConversation conv = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        if (!conv.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        conversationRepo.delete(conv);
    }

    // ── Helpers ─────────────────────────────────────

    private String generateResponse(String userMessage) {
        String lower = userMessage.toLowerCase();
        if (lower.contains("hola") || lower.contains("hello") || lower.contains("hi")) {
            return "¡Hola! 👋 Soy tu asistente Erasmus. Puedo ayudarte con información sobre ciudades, alojamiento, idiomas, documentos y más. ¿En qué puedo ayudarte?";
        }
        if (lower.contains("alojamiento") || lower.contains("piso") || lower.contains("housing")) {
            return "🏠 Para encontrar alojamiento te recomiendo:\n\n1. Revisa la sección de **Alojamiento** en la app\n2. Contacta con la oficina de relaciones internacionales de tu universidad\n3. Únete a grupos de estudiantes Erasmus en tu ciudad destino\n4. Plataformas como HousingAnywhere o Spotahome pueden ser útiles\n\n¿Necesitas ayuda con algo más?";
        }
        if (lower.contains("idioma") || lower.contains("language") || lower.contains("intercambio")) {
            return "🗣️ ¡El intercambio de idiomas es genial! Puedes:\n\n1. Usar la sección **Intercambio** de la app para encontrar compañeros\n2. Practicar con nativos de tu ciudad Erasmus\n3. Asistir a eventos de tándem lingüístico\n\n¿Qué idioma te gustaría practicar?";
        }
        if (lower.contains("documento") || lower.contains("visa") || lower.contains("papele")) {
            return "📄 Documentos importantes para tu Erasmus:\n\n1. **Learning Agreement** – firmado por ambas universidades\n2. **Tarjeta Sanitaria Europea** (TSE)\n3. Pasaporte/DNI vigente\n4. Seguro médico complementario\n5. Carta de aceptación de la universidad destino\n\n¿Necesitas ayuda con algún documento específico?";
        }
        return "🤔 Interesante pregunta. Como asistente Erasmus puedo ayudarte con:\n\n• 🏠 Alojamiento\n• 🗣️ Intercambio de idiomas\n• 📄 Documentación\n• 🗺️ Guía de ciudades\n• 🎉 Eventos y actividades\n• 💡 Consejos generales\n\n¿Sobre qué tema te gustaría saber más?";
    }

    private AiConversationResponse toResponse(AiConversation conv) {
        List<AiMessage> msgs = messageRepo.findByAiConversationIdOrderByCreatedAtAsc(conv.getId());
        return AiConversationResponse.builder()
                .id(conv.getId())
                .title(conv.getTitle())
                .messages(msgs.stream().map(this::toMsgResponse).toList())
                .createdAt(conv.getCreatedAt())
                .build();
    }

    private AiMessageResponse toMsgResponse(AiMessage m) {
        return AiMessageResponse.builder()
                .id(m.getId())
                .role(m.getRole().name())
                .content(m.getContent())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
