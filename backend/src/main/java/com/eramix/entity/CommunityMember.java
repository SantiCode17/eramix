package com.eramix.entity;

import com.eramix.entity.enums.CommunityMemberStatus;
import com.eramix.entity.enums.CommunityRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "community_member",
       uniqueConstraints = @UniqueConstraint(columnNames = {"community_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityMember extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private CommunityRole role = CommunityRole.MEMBER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private CommunityMemberStatus status = CommunityMemberStatus.ACTIVE;

    @Column(name = "joined_at", nullable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();
}
