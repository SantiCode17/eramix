package com.eramix.repository;

import com.eramix.entity.ExchangeSession;
import com.eramix.entity.enums.ExchangeSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExchangeSessionRepository extends JpaRepository<ExchangeSession, Long> {

    @Query("SELECT s FROM ExchangeSession s WHERE (s.userA.id = :userId OR s.userB.id = :userId) ORDER BY s.scheduledAt DESC")
    List<ExchangeSession> findAllByUser(Long userId);

    @Query("SELECT s FROM ExchangeSession s WHERE (s.userA.id = :userId OR s.userB.id = :userId) AND s.status = :status ORDER BY s.scheduledAt DESC")
    List<ExchangeSession> findAllByUserAndStatus(Long userId, ExchangeSessionStatus status);

    @Query("SELECT COUNT(s) FROM ExchangeSession s WHERE (s.userA.id = :userId OR s.userB.id = :userId) AND s.status = 'COMPLETED'")
    int countCompletedByUser(Long userId);
}
