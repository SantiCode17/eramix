package com.eramix.repository;

import com.eramix.entity.StoryView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoryViewRepository extends JpaRepository<StoryView, Long> {

    List<StoryView> findByStoryId(Long storyId);

    boolean existsByStoryIdAndViewerId(Long storyId, Long viewerId);

    long countByStoryId(Long storyId);
}
