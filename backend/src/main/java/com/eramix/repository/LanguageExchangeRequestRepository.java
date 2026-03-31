package com.eramix.repository;

import com.eramix.entity.LanguageExchangeRequest;
import com.eramix.entity.enums.ExchangeRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LanguageExchangeRequestRepository extends JpaRepository<LanguageExchangeRequest, Long> {

    List<LanguageExchangeRequest> findAllByRequesterIdAndStatus(Long requesterId, ExchangeRequestStatus status);

    List<LanguageExchangeRequest> findAllByTargetIdAndStatus(Long targetId, ExchangeRequestStatus status);

    @Query("SELECT r FROM LanguageExchangeRequest r WHERE (r.requester.id = :userId OR r.target.id = :userId) AND r.status = 'ACCEPTED'")
    List<LanguageExchangeRequest> findAcceptedByUser(Long userId);

    boolean existsByRequesterIdAndTargetIdAndOfferLanguageIdAndWantLanguageIdAndStatus(
            Long requesterId, Long targetId, Long offerLangId, Long wantLangId, ExchangeRequestStatus status);
}
