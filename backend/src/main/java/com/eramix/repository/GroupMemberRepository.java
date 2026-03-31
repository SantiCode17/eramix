package com.eramix.repository;

import com.eramix.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    List<GroupMember> findAllByGroupId(Long groupId);

    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    void deleteByGroupIdAndUserId(Long groupId, Long userId);

    List<GroupMember> findAllByUserId(Long userId);
}
