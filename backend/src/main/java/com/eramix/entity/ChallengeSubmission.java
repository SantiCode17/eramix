package com.eramix.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "challenge_submission",
       uniqueConstraints = @UniqueConstraint(columnNames = {"challenge_id", "user_id"}))
@Getter @Setter @NoArgsConstructor
public class ChallengeSubmission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private ErasmusChallenge challenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "photo_url", nullable = false, length = 512)
    private String photoUrl;

    @Column(length = 500)
    private String caption;

    @Column(name = "vote_count", nullable = false)
    private int voteCount = 0;
}
