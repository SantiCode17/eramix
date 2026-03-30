package com.eramix.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gestiona las sesiones WebSocket activas por usuario.
 * Un usuario puede tener múltiples sesiones (múltiples dispositivos).
 */
@Component
@Slf4j
public class WebSocketSessionManager {

    // userId (String) → Set de sessionIds
    private final Map<String, Set<String>> userSessions = new ConcurrentHashMap<>();
    // sessionId → userId (para limpieza rápida en disconnect)
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();

    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        if (accessor.getUser() != null) {
            String userId = accessor.getUser().getName();
            userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
            sessionToUser.put(sessionId, userId);
            log.info("WebSocket conectado: userId={}, sessionId={}, sesiones activas={}",
                    userId, sessionId, userSessions.get(userId).size());
        }
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        String userId = sessionToUser.remove(sessionId);

        if (userId != null) {
            Set<String> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(sessionId);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId);
                    log.info("WebSocket desconectado: userId={} (ya no tiene sesiones activas)", userId);
                } else {
                    log.info("WebSocket desconectado: userId={}, sessionId={}, sesiones restantes={}",
                            userId, sessionId, sessions.size());
                }
            }
        }
    }

    /**
     * Verifica si un usuario tiene al menos una sesión WebSocket activa.
     */
    public boolean isUserOnline(Long userId) {
        Set<String> sessions = userSessions.get(String.valueOf(userId));
        return sessions != null && !sessions.isEmpty();
    }

    /**
     * Devuelve el conjunto de sessionIds activos para un usuario.
     */
    public Set<String> getUserSessions(Long userId) {
        return userSessions.getOrDefault(String.valueOf(userId), Collections.emptySet());
    }

    /**
     * Devuelve el número total de usuarios conectados.
     */
    public int getOnlineUserCount() {
        return userSessions.size();
    }
}
