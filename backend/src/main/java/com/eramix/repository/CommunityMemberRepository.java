package com.eramix.repository;

import com.eramix.entity.CommunityMember;
import com.eramix.entity.enums.CommunityMemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {

    Optional<CommunityMember> findByCommunityIdAndUserId(Long communityId, Long userId);

    boolean existsByCommunityIdAndUserId(Long communityId, Long userId);

    List<CommunityMember> findAllByCommunityId(Long communityId);

    List<CommunityMember> findAllByCommunityIdAndStatus(Long communityId, CommunityMemberStatus status);

    void deleteByCommunityIdAndUserId(Long communityId, Long userId);

    List<CommunityMember> findAllByUserId(Long userId);
}
