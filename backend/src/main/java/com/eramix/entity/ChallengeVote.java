package com.eramix.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "challenge_vote",
       uniqueConstraints = @UniqueConstraint(columnNames = {"submission_id", "user_id"}))
@Getter @Setter @NoArgsConstructor
public class ChallengeVote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private ChallengeSubmission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
