package com.eramix.repository;

import com.eramix.entity.GroupMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {

    Page<GroupMessage> findAllByGroupIdOrderByCreatedAtDesc(Long groupId, Pageable pageable);

    @Query("SELECT m FROM GroupMessage m WHERE m.group.id = :groupId ORDER BY m.createdAt DESC LIMIT 1")
    Optional<GroupMessage> findLastMessageByGroupId(@Param("groupId") Long groupId);

    @Query("SELECT COUNT(m) FROM GroupMessage m WHERE m.group.id = :groupId AND m.id > :lastReadMessageId")
    int countUnreadMessages(@Param("groupId") Long groupId, @Param("lastReadMessageId") Long lastReadMessageId);

    @Query("SELECT COUNT(m) FROM GroupMessage m WHERE m.group.id = :groupId")
    int countAllByGroupId(@Param("groupId") Long groupId);
}
