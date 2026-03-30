package com.eramix.service;

import com.eramix.dto.social.FriendRequestResponse;
import com.eramix.dto.social.FriendshipResponse;
import com.eramix.entity.*;
import com.eramix.entity.enums.FriendRequestStatus;
import com.eramix.entity.enums.NotificationType;
import com.eramix.exception.UserNotFoundException;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final FriendshipRepository friendshipRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ── 1. POST /requests ── Enviar solicitud ─────────────

    @Transactional
    public FriendRequestResponse sendRequest(Long senderId, Long receiverId) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("No puedes enviarte una solicitud a ti mismo");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException(senderId));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new UserNotFoundException(receiverId));

        // Verificar si ya existe una solicitud entre ambos
        friendRequestRepository.findBetweenUsers(senderId, receiverId)
                .ifPresent(existing -> {
                    if (existing.getStatus() == FriendRequestStatus.BLOCKED) {
                        throw new IllegalArgumentException("No puedes enviar solicitud a este usuario");
                    }
                    if (existing.getStatus() == FriendRequestStatus.PENDING) {
                        throw new IllegalArgumentException("Ya existe una solicitud pendiente");
                    }
                    if (existing.getStatus() == FriendRequestStatus.ACCEPTED) {
                        throw new IllegalArgumentException("Ya sois amigos");
                    }
                });

        // Verificar si ya son amigos
        friendshipRepository.findBetweenUsers(senderId, receiverId)
                .ifPresent(f -> {
                    throw new IllegalArgumentException("Ya sois amigos");
                });

        FriendRequest request = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build();

        request = friendRequestRepository.save(request);

        // Notificar al receptor
        notificationService.send(receiverId, NotificationType.FRIEND_REQUEST,
                "Nueva solicitud de amistad",
                sender.getFirstName() + " " + sender.getLastName() + " quiere ser tu amigo",
                "{\"senderId\":" + senderId + "}");

        return mapToRequestResponse(request);
    }

    // ── 2. GET /requests/received ── Solicitudes recibidas

    @Transactional(readOnly = true)
    public List<FriendRequestResponse> getReceivedRequests(Long userId) {
        return friendRequestRepository
                .findByReceiverIdAndStatus(userId, FriendRequestStatus.PENDING)
                .stream()
                .map(this::mapToRequestResponse)
                .toList();
    }

    // ── 3. GET /requests/sent ── Solicitudes enviadas ────

    @Transactional(readOnly = true)
    public List<FriendRequestResponse> getSentRequests(Long userId) {
        return friendRequestRepository
                .findBySenderIdAndStatus(userId, FriendRequestStatus.PENDING)
                .stream()
                .map(this::mapToRequestResponse)
                .toList();
    }

    // ── 4. PUT /requests/{id} ── Aceptar / Rechazar ──────

    @Transactional
    public FriendRequestResponse respondToRequest(Long requestId, Long userId, String action) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        if (!request.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("No tienes permiso para responder a esta solicitud");
        }

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalArgumentException("Esta solicitud ya fue procesada");
        }

        FriendRequestStatus newStatus = FriendRequestStatus.valueOf(action);
        request.setStatus(newStatus);
        request = friendRequestRepository.save(request);

        // Si acepta, crear amistad y conversación
        if (newStatus == FriendRequestStatus.ACCEPTED) {
            createFriendship(request.getSender(), request.getReceiver());
            createConversationIfNotExists(request.getSender(), request.getReceiver());

            // Notificar al emisor
            notificationService.send(request.getSender().getId(),
                    NotificationType.FRIEND_ACCEPTED,
                    "Solicitud aceptada",
                    request.getReceiver().getFirstName() + " aceptó tu solicitud de amistad",
                    "{\"friendId\":" + request.getReceiver().getId() + "}");
        }

        return mapToRequestResponse(request);
    }

    // ── 5. DELETE /requests/{id} ── Cancelar solicitud ───

    @Transactional
    public void cancelRequest(Long requestId, Long userId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        if (!request.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("Solo el emisor puede cancelar la solicitud");
        }

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new IllegalArgumentException("Solo se pueden cancelar solicitudes pendientes");
        }

        friendRequestRepository.delete(request);
    }

    // ── 6. GET / ── Listar amigos ─────────────────────────

    @Transactional(readOnly = true)
    public List<FriendshipResponse> getFriends(Long userId) {
        return friendshipRepository.findAllByUserId(userId)
                .stream()
                .map(f -> mapToFriendshipResponse(f, userId))
                .toList();
    }

    // ── 7. DELETE /{friendId} ── Eliminar amigo ───────────

    @Transactional
    public void removeFriend(Long userId, Long friendId) {
        Friendship friendship = friendshipRepository.findBetweenUsers(userId, friendId)
                .orElseThrow(() -> new IllegalArgumentException("No sois amigos"));
        friendshipRepository.delete(friendship);
    }

    // ── 8. POST /block/{userId} ── Bloquear usuario ──────

    @Transactional
    public void blockUser(Long blockerId, Long blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new IllegalArgumentException("No puedes bloquearte a ti mismo");
        }

        // Eliminar amistad si existe
        friendshipRepository.findBetweenUsers(blockerId, blockedId)
                .ifPresent(friendshipRepository::delete);

        // Buscar solicitud existente o crear nueva con estado BLOCKED
        FriendRequest request = friendRequestRepository
                .findBetweenUsers(blockerId, blockedId)
                .orElse(FriendRequest.builder()
                        .sender(userRepository.findById(blockerId)
                                .orElseThrow(() -> new UserNotFoundException(blockerId)))
                        .receiver(userRepository.findById(blockedId)
                                .orElseThrow(() -> new UserNotFoundException(blockedId)))
                        .build());

        request.setStatus(FriendRequestStatus.BLOCKED);
        friendRequestRepository.save(request);
    }

    // ── 9. DELETE /block/{userId} ── Desbloquear usuario ─

    @Transactional
    public void unblockUser(Long blockerId, Long blockedId) {
        FriendRequest request = friendRequestRepository
                .findBetweenUsers(blockerId, blockedId)
                .orElseThrow(() -> new IllegalArgumentException("No has bloqueado a este usuario"));

        if (request.getStatus() != FriendRequestStatus.BLOCKED) {
            throw new IllegalArgumentException("Este usuario no está bloqueado");
        }

        friendRequestRepository.delete(request);
    }

    // ── 10. GET /blocked ── Listar usuarios bloqueados ───

    @Transactional(readOnly = true)
    public List<FriendRequestResponse> getBlockedUsers(Long userId) {
        return friendRequestRepository
                .findBySenderIdAndStatus(userId, FriendRequestStatus.BLOCKED)
                .stream()
                .map(this::mapToRequestResponse)
                .toList();
    }

    // ── Helpers ───────────────────────────────────────────

    private void createFriendship(User user1, User user2) {
        // Normalizar: el de ID menor va primero
        User first = user1.getId() < user2.getId() ? user1 : user2;
        User second = user1.getId() < user2.getId() ? user2 : user1;

        if (friendshipRepository.findBetweenUsers(first.getId(), second.getId()).isEmpty()) {
            Friendship friendship = Friendship.builder()
                    .user1(first)
                    .user2(second)
                    .build();
            friendshipRepository.save(friendship);
        }
    }

    private void createConversationIfNotExists(User user1, User user2) {
        if (conversationRepository.findBetweenUsers(user1.getId(), user2.getId()).isEmpty()) {
            Conversation conversation = Conversation.builder()
                    .user1(user1)
                    .user2(user2)
                    .build();
            conversationRepository.save(conversation);
        }
    }

    // ── Mappers ───────────────────────────────────────────

    private FriendRequestResponse mapToRequestResponse(FriendRequest r) {
        return FriendRequestResponse.builder()
                .id(r.getId())
                .senderId(r.getSender().getId())
                .senderFirstName(r.getSender().getFirstName())
                .senderLastName(r.getSender().getLastName())
                .senderProfilePhotoUrl(r.getSender().getProfilePhotoUrl())
                .receiverId(r.getReceiver().getId())
                .receiverFirstName(r.getReceiver().getFirstName())
                .receiverLastName(r.getReceiver().getLastName())
                .receiverProfilePhotoUrl(r.getReceiver().getProfilePhotoUrl())
                .status(r.getStatus().name())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private FriendshipResponse mapToFriendshipResponse(Friendship f, Long currentUserId) {
        User friend = f.getUser1().getId().equals(currentUserId) ? f.getUser2() : f.getUser1();
        return FriendshipResponse.builder()
                .friendshipId(f.getId())
                .friendId(friend.getId())
                .friendFirstName(friend.getFirstName())
                .friendLastName(friend.getLastName())
                .friendProfilePhotoUrl(friend.getProfilePhotoUrl())
                .friendDestinationCity(friend.getDestinationCity())
                .friendDestinationCountry(friend.getDestinationCountry())
                .friendsSince(f.getCreatedAt())
                .build();
    }
}
