package com.eramix.repository;

import com.eramix.entity.CommunityPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    Page<CommunityPost> findAllByCommunityIdOrderByIsPinnedDescCreatedAtDesc(Long communityId, Pageable pageable);
}
