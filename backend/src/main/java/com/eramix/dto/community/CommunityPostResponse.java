package com.eramix.dto.community;

import lombok.*;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityPostResponse {

    private Long id;
    private Long communityId;
    private Long authorId;
    private String authorFirstName;
    private String authorLastName;
    private String authorProfilePhotoUrl;
    private String content;
    private String imageUrl;
    private int likeCount;
    private int commentCount;
    private boolean isPinned;
    private boolean likedByCurrentUser;
    private Instant createdAt;

    private List<CommunityCommentResponse> recentComments;
}
