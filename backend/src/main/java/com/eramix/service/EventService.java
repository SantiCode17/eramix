package com.eramix.service;

import com.eramix.dto.PageResponse;
import com.eramix.dto.event.*;
import com.eramix.entity.Event;
import com.eramix.entity.EventParticipant;
import com.eramix.entity.User;
import com.eramix.entity.enums.EventParticipantStatus;
import com.eramix.entity.enums.NotificationType;
import com.eramix.exception.UserNotFoundException;
import com.eramix.repository.EventParticipantRepository;
import com.eramix.repository.EventRepository;
import com.eramix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ── 1. POST / ── Crear evento ─────────────────────────

    @Transactional
    public EventResponse createEvent(Long userId, EventRequest request) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Event event = Event.builder()
                .creator(creator)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .location(request.getLocation())
                .latitude(request.getLatitude() != null ?
                        BigDecimal.valueOf(request.getLatitude()) : null)
                .longitude(request.getLongitude() != null ?
                        BigDecimal.valueOf(request.getLongitude()) : null)
                .startDatetime(request.getStartDatetime())
                .endDatetime(request.getEndDatetime())
                .maxParticipants(request.getMaxParticipants())
                .isPublic(request.getIsPublic())
                .build();

        event = eventRepository.save(event);

        // El creador se une automáticamente
        EventParticipant participant = EventParticipant.builder()
                .event(event)
                .user(creator)
                .status(EventParticipantStatus.GOING)
                .joinedAt(Instant.now())
                .build();
        eventParticipantRepository.save(participant);

        return mapToResponse(event);
    }

    // ── 2. GET /{id} ── Detalle de evento ─────────────────

    @Transactional(readOnly = true)
    public EventResponse getEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento no encontrado"));
        return mapToResponse(event);
    }

    // ── 3. PUT /{id} ── Actualizar evento ─────────────────

    @Transactional
    public EventResponse updateEvent(Long eventId, Long userId, EventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento no encontrado"));

        if (!event.getCreator().getId().equals(userId)) {
            throw new IllegalArgumentException("Solo el creador puede editar el evento");
        }

        if (request.getTitle() != null) event.setTitle(request.getTitle());
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getCategory() != null) event.setCategory(request.getCategory());
        if (request.getLocation() != null) event.setLocation(request.getLocation());
        if (request.getLatitude() != null) event.setLatitude(BigDecimal.valueOf(request.getLatitude()));
        if (request.getLongitude() != null) event.setLongitude(BigDecimal.valueOf(request.getLongitude()));
        if (request.getStartDatetime() != null) event.setStartDatetime(request.getStartDatetime());
        if (request.getEndDatetime() != null) event.setEndDatetime(request.getEndDatetime());
        if (request.getMaxParticipants() != null) event.setMaxParticipants(request.getMaxParticipants());
        if (request.getIsPublic() != null) event.setIsPublic(request.getIsPublic());

        return mapToResponse(eventRepository.save(event));
    }

    // ── 4. DELETE /{id} ── Eliminar evento ────────────────

    @Transactional
    public void deleteEvent(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento no encontrado"));

        if (!event.getCreator().getId().equals(userId)) {
            throw new IllegalArgumentException("Solo el creador puede eliminar el evento");
        }

        eventRepository.delete(event);
    }

    // ── 5. POST /{id}/join ── Unirse / cambiar estado ─────

    @Transactional
    public EventParticipantResponse joinEvent(Long eventId, Long userId, String status) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Evento no encontrado"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Verificar límite de participantes
        EventParticipantStatus participantStatus = EventParticipantStatus.valueOf(status);
        if (participantStatus == EventParticipantStatus.GOING && event.getMaxParticipants() != null) {
            long currentCount = eventParticipantRepository.countByEventId(eventId);
            if (currentCount >= event.getMaxParticipants()) {
                throw new IllegalArgumentException("El evento ha alcanzado el máximo de participantes");
            }
        }

        EventParticipant.EventParticipantId compositeId =
                new EventParticipant.EventParticipantId(eventId, userId);

        EventParticipant participant = eventParticipantRepository.findById(compositeId)
                .orElse(EventParticipant.builder()
                        .event(event)
                        .user(user)
                        .joinedAt(Instant.now())
                        .build());

        participant.setStatus(participantStatus);
        participant = eventParticipantRepository.save(participant);

        // Notificar al creador
        if (!event.getCreator().getId().equals(userId)) {
            notificationService.send(event.getCreator().getId(),
                    NotificationType.EVENT_INVITATION,
                    "Nuevo participante",
                    user.getFirstName() + " se unió a tu evento \"" + event.getTitle() + "\"",
                    "{\"eventId\":" + eventId + ",\"userId\":" + userId + "}");
        }

        return mapToParticipantResponse(participant);
    }

    // ── 6. DELETE /{id}/leave ── Salir del evento ─────────

    @Transactional
    public void leaveEvent(Long eventId, Long userId) {
        EventParticipant.EventParticipantId compositeId =
                new EventParticipant.EventParticipantId(eventId, userId);

        EventParticipant participant = eventParticipantRepository.findById(compositeId)
                .orElseThrow(() -> new IllegalArgumentException("No estás en este evento"));

        eventParticipantRepository.delete(participant);
    }

    // ── 7. GET /{id}/participants ── Participantes ────────

    @Transactional(readOnly = true)
    public List<EventParticipantResponse> getParticipants(Long eventId) {
        return eventParticipantRepository.findByEventId(eventId).stream()
                .map(this::mapToParticipantResponse)
                .toList();
    }

    // ── 8. GET /upcoming ── Eventos públicos próximos ─────

    @Transactional(readOnly = true)
    public PageResponse<EventResponse> getUpcomingEvents(String category, int page, int size) {
        Page<Event> pageResult;
        if (category != null && !category.isBlank()) {
            pageResult = eventRepository.findUpcomingByCategory(
                    Instant.now(), category, PageRequest.of(page, size));
        } else {
            pageResult = eventRepository.findUpcomingPublicEvents(
                    Instant.now(), PageRequest.of(page, size));
        }

        return PageResponse.<EventResponse>builder()
                .content(pageResult.getContent().stream().map(this::mapToResponse).toList())
                .page(pageResult.getNumber())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .first(pageResult.isFirst())
                .last(pageResult.isLast())
                .build();
    }

    // ── 9. GET /my-events ── Mis eventos ──────────────────

    @Transactional(readOnly = true)
    public List<EventResponse> getMyEvents(Long userId) {
        return eventRepository.findByCreatorId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── 10. GET /joined ── Eventos en los que participo ───

    @Transactional(readOnly = true)
    public List<EventResponse> getJoinedEvents(Long userId) {
        return eventParticipantRepository.findByUserId(userId).stream()
                .map(ep -> mapToResponse(ep.getEvent()))
                .toList();
    }

    // ── Mappers ───────────────────────────────────────────

    private EventResponse mapToResponse(Event e) {
        long participantCount = eventParticipantRepository.countByEventId(e.getId());
        return EventResponse.builder()
                .id(e.getId())
                .creatorId(e.getCreator().getId())
                .creatorFirstName(e.getCreator().getFirstName())
                .creatorLastName(e.getCreator().getLastName())
                .creatorProfilePhotoUrl(e.getCreator().getProfilePhotoUrl())
                .title(e.getTitle())
                .description(e.getDescription())
                .category(e.getCategory())
                .location(e.getLocation())
                .latitude(e.getLatitude() != null ? e.getLatitude().doubleValue() : null)
                .longitude(e.getLongitude() != null ? e.getLongitude().doubleValue() : null)
                .startDatetime(e.getStartDatetime())
                .endDatetime(e.getEndDatetime())
                .maxParticipants(e.getMaxParticipants())
                .participantCount(participantCount)
                .isPublic(e.getIsPublic())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private EventParticipantResponse mapToParticipantResponse(EventParticipant ep) {
        return EventParticipantResponse.builder()
                .userId(ep.getUser().getId())
                .firstName(ep.getUser().getFirstName())
                .lastName(ep.getUser().getLastName())
                .profilePhotoUrl(ep.getUser().getProfilePhotoUrl())
                .status(ep.getStatus().name())
                .joinedAt(ep.getJoinedAt())
                .build();
    }
}
