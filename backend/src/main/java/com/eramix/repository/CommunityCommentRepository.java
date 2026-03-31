package com.eramix.repository;

import com.eramix.entity.CommunityComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Long> {

    List<CommunityComment> findAllByPostIdOrderByCreatedAtAsc(Long postId);

    List<CommunityComment> findTop3ByPostIdOrderByCreatedAtDesc(Long postId);
}
