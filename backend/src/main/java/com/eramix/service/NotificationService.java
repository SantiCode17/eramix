package com.eramix.service;

import com.eramix.dto.PageResponse;
import com.eramix.dto.notification.NotificationResponse;
import com.eramix.entity.Notification;
import com.eramix.entity.User;
import com.eramix.entity.enums.NotificationType;
import com.eramix.repository.NotificationRepository;
import com.eramix.repository.UserRepository;
import com.eramix.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // ── Internal – crear notificación ─────────────────────

    @Transactional
    public void send(Long userId, NotificationType type, String title, String body, String data) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .body(body)
                .data(data)
                .build();

        notificationRepository.save(notification);
        log.debug("Notificación enviada a userId={}: {}", userId, title);
    }

    // ── Listar notificaciones (paginadas) ─────────────────

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotifications(Long userId, int page, int size) {
        Page<Notification> pageResult = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));

        return PageResponse.<NotificationResponse>builder()
                .content(pageResult.getContent().stream().map(this::toResponse).toList())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .first(pageResult.isFirst())
                .last(pageResult.isLast())
                .build();
    }

    // ── Contar no leídas ──────────────────────────────────

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // ── Marcar una como leída ─────────────────────────────

    @Transactional
    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notificación no encontrada"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("No tienes permiso para esta notificación");
        }

        notification.setIsRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    // ── Marcar todas como leídas ──────────────────────────

    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsReadByUserId(userId);
    }

    // ── Eliminar notificación ─────────────────────────────

    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notificación no encontrada"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("No tienes permiso para esta notificación");
        }

        notificationRepository.delete(notification);
    }

    // ── Mapper ────────────────────────────────────────────

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType().name())
                .title(n.getTitle())
                .body(n.getBody())
                .data(n.getData())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
