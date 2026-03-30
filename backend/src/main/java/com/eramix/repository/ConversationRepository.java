package com.eramix.repository;

import com.eramix.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.user1.id = :userId OR c.user2.id = :userId ORDER BY c.lastMessageAt DESC NULLS LAST")
    List<Conversation> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE " +
            "(c.user1.id = :userId1 AND c.user2.id = :userId2) OR " +
            "(c.user1.id = :userId2 AND c.user2.id = :userId1)")
    Optional<Conversation> findBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
