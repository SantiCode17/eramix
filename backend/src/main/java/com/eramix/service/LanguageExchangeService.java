package com.eramix.service;

import com.eramix.dto.exchange.*;
import com.eramix.entity.*;
import com.eramix.entity.enums.ExchangeRequestStatus;
import com.eramix.entity.enums.ExchangeSessionStatus;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LanguageExchangeService {

    private final LanguageExchangeRequestRepository requestRepo;
    private final ExchangeSessionRepository sessionRepo;
    private final ExchangeReviewRepository reviewRepo;
    private final UserRepository userRepo;
    private final LanguageRepository languageRepo;
    private final UserLanguageRepository userLanguageRepo;

    // ── Solicitudes ─────────────────────────────────────

    @Transactional
    public ExchangeRequestResponse createRequest(Long userId, ExchangeRequestDTO dto) {
        User requester = userRepo.findById(userId).orElseThrow();
        User target    = userRepo.findById(dto.getTargetUserId()).orElseThrow();
        Language offer  = languageRepo.findById(dto.getOfferLanguageId()).orElseThrow();
        Language want   = languageRepo.findById(dto.getWantLanguageId()).orElseThrow();

        if (requestRepo.existsByRequesterIdAndTargetIdAndOfferLanguageIdAndWantLanguageIdAndStatus(
                userId, dto.getTargetUserId(), dto.getOfferLanguageId(), dto.getWantLanguageId(),
                ExchangeRequestStatus.PENDING)) {
            throw new RuntimeException("Ya tienes una solicitud pendiente con este usuario para estos idiomas");
        }

        LanguageExchangeRequest req = LanguageExchangeRequest.builder()
                .requester(requester)
                .target(target)
                .offerLanguage(offer)
                .wantLanguage(want)
                .message(dto.getMessage())
                .build();

        return toRequestResponse(requestRepo.save(req));
    }

    public List<ExchangeRequestResponse> getPendingReceived(Long userId) {
        return requestRepo.findAllByTargetIdAndStatus(userId, ExchangeRequestStatus.PENDING)
                .stream().map(this::toRequestResponse).collect(Collectors.toList());
    }

    public List<ExchangeRequestResponse> getMySentRequests(Long userId) {
        return requestRepo.findAllByRequesterIdAndStatus(userId, ExchangeRequestStatus.PENDING)
                .stream().map(this::toRequestResponse).collect(Collectors.toList());
    }

    @Transactional
    public ExchangeRequestResponse acceptRequest(Long requestId, Long userId) {
        LanguageExchangeRequest req = requestRepo.findById(requestId).orElseThrow();
        if (!req.getTarget().getId().equals(userId))
            throw new RuntimeException("No tienes permisos para aceptar esta solicitud");
        req.setStatus(ExchangeRequestStatus.ACCEPTED);
        return toRequestResponse(requestRepo.save(req));
    }

    @Transactional
    public ExchangeRequestResponse rejectRequest(Long requestId, Long userId) {
        LanguageExchangeRequest req = requestRepo.findById(requestId).orElseThrow();
        if (!req.getTarget().getId().equals(userId))
            throw new RuntimeException("No tienes permisos para rechazar esta solicitud");
        req.setStatus(ExchangeRequestStatus.REJECTED);
        return toRequestResponse(requestRepo.save(req));
    }

    // ── Partners (usuarios compatibles para intercambio) ─

    public List<ExchangePartnerResponse> findPartners(Long userId) {
        List<UserLanguage> myLanguages = userLanguageRepo.findByUserId(userId);
        // Buscar usuarios que enseñen un idioma que yo quiero aprender
        // y que quieran aprender un idioma que yo enseño
        // Simplificación: devolver usuarios con idiomas complementarios
        List<User> allUsers = userRepo.findAll();
        return allUsers.stream()
                .filter(u -> !u.getId().equals(userId))
                .map(u -> toPartnerResponse(u, userId))
                .filter(p -> !p.getTeaches().isEmpty())
                .limit(50)
                .collect(Collectors.toList());
    }

    // ── Sesiones ────────────────────────────────────────

    @Transactional
    public ExchangeSessionResponse scheduleSession(Long userId, ScheduleSessionRequest dto) {
        LanguageExchangeRequest req = requestRepo.findById(dto.getRequestId()).orElseThrow();
        if (req.getStatus() != ExchangeRequestStatus.ACCEPTED)
            throw new RuntimeException("La solicitud debe estar aceptada para agendar una sesión");
        if (!req.getRequester().getId().equals(userId) && !req.getTarget().getId().equals(userId))
            throw new RuntimeException("No tienes permisos");

        ExchangeSession session = ExchangeSession.builder()
                .request(req)
                .userA(req.getRequester())
                .userB(req.getTarget())
                .scheduledAt(dto.getScheduledAt())
                .durationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 30)
                .notes(dto.getNotes())
                .build();

        return toSessionResponse(sessionRepo.save(session));
    }

    public List<ExchangeSessionResponse> getMySessions(Long userId) {
        return sessionRepo.findAllByUser(userId).stream()
                .map(this::toSessionResponse).collect(Collectors.toList());
    }

    @Transactional
    public ExchangeSessionResponse completeSession(Long sessionId, Long userId) {
        ExchangeSession session = sessionRepo.findById(sessionId).orElseThrow();
        if (!session.getUserA().getId().equals(userId) && !session.getUserB().getId().equals(userId))
            throw new RuntimeException("No tienes permisos");
        session.setStatus(ExchangeSessionStatus.COMPLETED);
        return toSessionResponse(sessionRepo.save(session));
    }

    @Transactional
    public ExchangeSessionResponse cancelSession(Long sessionId, Long userId) {
        ExchangeSession session = sessionRepo.findById(sessionId).orElseThrow();
        if (!session.getUserA().getId().equals(userId) && !session.getUserB().getId().equals(userId))
            throw new RuntimeException("No tienes permisos");
        session.setStatus(ExchangeSessionStatus.CANCELLED);
        return toSessionResponse(sessionRepo.save(session));
    }

    // ── Reseñas ─────────────────────────────────────────

    @Transactional
    public ExchangeReviewResponse createReview(Long userId, ExchangeReviewRequest dto) {
        ExchangeSession session = sessionRepo.findById(dto.getSessionId()).orElseThrow();
        if (session.getStatus() != ExchangeSessionStatus.COMPLETED)
            throw new RuntimeException("Solo se puede valorar sesiones completadas");
        if (!session.getUserA().getId().equals(userId) && !session.getUserB().getId().equals(userId))
            throw new RuntimeException("No tienes permisos");
        if (reviewRepo.existsBySessionIdAndReviewerId(dto.getSessionId(), userId))
            throw new RuntimeException("Ya has valorado esta sesión");

        User reviewer = userRepo.findById(userId).orElseThrow();
        User reviewee = session.getUserA().getId().equals(userId) ? session.getUserB() : session.getUserA();

        ExchangeReview review = ExchangeReview.builder()
                .session(session)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        return toReviewResponse(reviewRepo.save(review));
    }

    public List<ExchangeReviewResponse> getReviewsForUser(Long userId) {
        return reviewRepo.findAllByRevieweeIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toReviewResponse).collect(Collectors.toList());
    }

    // ── Mappers ─────────────────────────────────────────

    private ExchangeRequestResponse toRequestResponse(LanguageExchangeRequest r) {
        return ExchangeRequestResponse.builder()
                .id(r.getId())
                .requesterId(r.getRequester().getId())
                .requesterFirstName(r.getRequester().getFirstName())
                .requesterLastName(r.getRequester().getLastName())
                .requesterProfilePhotoUrl(r.getRequester().getProfilePhotoUrl())
                .targetId(r.getTarget().getId())
                .targetFirstName(r.getTarget().getFirstName())
                .targetLastName(r.getTarget().getLastName())
                .targetProfilePhotoUrl(r.getTarget().getProfilePhotoUrl())
                .offerLanguageId(r.getOfferLanguage().getId())
                .offerLanguageName(r.getOfferLanguage().getName())
                .wantLanguageId(r.getWantLanguage().getId())
                .wantLanguageName(r.getWantLanguage().getName())
                .message(r.getMessage())
                .status(r.getStatus().name())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private ExchangeSessionResponse toSessionResponse(ExchangeSession s) {
        return ExchangeSessionResponse.builder()
                .id(s.getId())
                .requestId(s.getRequest().getId())
                .userAId(s.getUserA().getId())
                .userAFirstName(s.getUserA().getFirstName())
                .userALastName(s.getUserA().getLastName())
                .userAProfilePhotoUrl(s.getUserA().getProfilePhotoUrl())
                .userBId(s.getUserB().getId())
                .userBFirstName(s.getUserB().getFirstName())
                .userBLastName(s.getUserB().getLastName())
                .userBProfilePhotoUrl(s.getUserB().getProfilePhotoUrl())
                .offerLanguageName(s.getRequest().getOfferLanguage().getName())
                .wantLanguageName(s.getRequest().getWantLanguage().getName())
                .scheduledAt(s.getScheduledAt())
                .durationMinutes(s.getDurationMinutes())
                .status(s.getStatus().name())
                .notes(s.getNotes())
                .createdAt(s.getCreatedAt())
                .build();
    }

    private ExchangeReviewResponse toReviewResponse(ExchangeReview r) {
        return ExchangeReviewResponse.builder()
                .id(r.getId())
                .sessionId(r.getSession().getId())
                .reviewerId(r.getReviewer().getId())
                .reviewerFirstName(r.getReviewer().getFirstName())
                .reviewerLastName(r.getReviewer().getLastName())
                .revieweeId(r.getReviewee().getId())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private ExchangePartnerResponse toPartnerResponse(User u, Long currentUserId) {
        List<UserLanguage> langs = userLanguageRepo.findByUserId(u.getId());
        Double avgRating = reviewRepo.findAverageRatingByReviewee(u.getId());
        int sessionsCompleted = sessionRepo.countCompletedByUser(u.getId());

        List<ExchangePartnerResponse.LanguageInfo> teaches = langs.stream()
                .filter(l -> l.getProficiencyLevel().name().equals("ADVANCED")
                          || l.getProficiencyLevel().name().equals("NATIVE"))
                .map(l -> ExchangePartnerResponse.LanguageInfo.builder()
                        .languageId(l.getLanguage().getId())
                        .languageName(l.getLanguage().getName())
                        .proficiencyLevel(l.getProficiencyLevel().name())
                        .build())
                .collect(Collectors.toList());

        List<ExchangePartnerResponse.LanguageInfo> learns = langs.stream()
                .filter(l -> l.getProficiencyLevel().name().equals("BASIC")
                          || l.getProficiencyLevel().name().equals("INTERMEDIATE"))
                .map(l -> ExchangePartnerResponse.LanguageInfo.builder()
                        .languageId(l.getLanguage().getId())
                        .languageName(l.getLanguage().getName())
                        .proficiencyLevel(l.getProficiencyLevel().name())
                        .build())
                .collect(Collectors.toList());

        return ExchangePartnerResponse.builder()
                .userId(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .profilePhotoUrl(u.getProfilePhotoUrl())
                .destinationCity(u.getDestinationCity())
                .averageRating(avgRating != null ? Math.round(avgRating * 10) / 10.0 : null)
                .sessionsCompleted(sessionsCompleted)
                .teaches(teaches)
                .learns(learns)
                .build();
    }
}
