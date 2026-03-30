package com.eramix.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

/**
 * Interceptor de handshake WebSocket que extrae el JWT del query param "token",
 * lo valida y almacena el userId en los atributos de sesión.
 * Si el token es inválido o falta, rechaza la conexión.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {
        try {
            String token = extractToken(request);
            if (token == null) {
                log.warn("WebSocket handshake rechazado: no se proporcionó token JWT");
                return false;
            }

            jwtTokenProvider.validateToken(token);
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            attributes.put("userId", userId);
            log.debug("WebSocket handshake exitoso para userId={}", userId);
            return true;

        } catch (Exception e) {
            log.warn("WebSocket handshake rechazado: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        // No-op
    }

    private String extractToken(ServerHttpRequest request) {
        // 1. Intentar del query param ?token=xxx
        String query = request.getURI().getQuery();
        if (query != null) {
            var params = UriComponentsBuilder.fromUriString("?" + query).build().getQueryParams();
            String token = params.getFirst("token");
            if (token != null && !token.isBlank()) {
                return token;
            }
        }

        // 2. Intentar del header Authorization (algunos clientes STOMP lo envían)
        if (request instanceof ServletServerHttpRequest servletRequest) {
            String header = servletRequest.getServletRequest().getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                return header.substring(7);
            }
        }

        return null;
    }
}
