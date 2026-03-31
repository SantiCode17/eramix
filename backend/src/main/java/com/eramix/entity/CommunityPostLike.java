package com.eramix.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "community_post_like",
       uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityPostLike extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private CommunityPost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
