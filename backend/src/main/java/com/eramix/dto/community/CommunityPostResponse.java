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

    // Boolean (boxed) → Lombok generates getIsPinned() → Jackson emits "isPinned".
    // primitive boolean isPinned → getter isPinned() → Jackson strips "is" → emits "pinned" (BUG).
    private Boolean isPinned;

    private boolean likedByCurrentUser;
    private Instant createdAt;

    private List<CommunityCommentResponse> recentComments;
}
