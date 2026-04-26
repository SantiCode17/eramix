package com.eramix.repository;

import com.eramix.entity.StoryReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoryReactionRepository extends JpaRepository<StoryReaction, Long> {

    Optional<StoryReaction> findByStoryIdAndUserId(Long storyId, Long userId);

    long countByStoryId(Long storyId);

    void deleteByStoryIdAndUserId(Long storyId, Long userId);
}
