package com.eramix.repository;

import com.eramix.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :convId AND m.id < :cursor ORDER BY m.id DESC")
    List<Message> findByConversationCursor(@Param("convId") Long conversationId,
                                           @Param("cursor") Long cursor,
                                           Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :convId ORDER BY m.id DESC")
    List<Message> findByConversationLatest(@Param("convId") Long conversationId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :convId AND m.isRead = false AND m.sender.id != :userId")
    long countUnreadByConversation(@Param("convId") Long conversationId, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :convId AND m.sender.id != :userId AND m.isRead = false")
    int markAsRead(@Param("convId") Long conversationId, @Param("userId") Long userId);
}
