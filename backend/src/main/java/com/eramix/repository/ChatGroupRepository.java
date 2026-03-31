package com.eramix.repository;

import com.eramix.entity.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {

    @Query("SELECT DISTINCT g FROM ChatGroup g " +
            "JOIN g.members m " +
            "WHERE m.user.id = :userId AND g.isActive = true " +
            "ORDER BY g.updatedAt DESC")
    List<ChatGroup> findAllByMemberUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM GroupMember m WHERE m.group.id = :groupId")
    int countMembers(@Param("groupId") Long groupId);
}
