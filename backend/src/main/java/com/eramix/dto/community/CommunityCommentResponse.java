package com.eramix.dto.community;

import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityCommentResponse {

    private Long id;
    private Long postId;
    private Long authorId;
    private String authorFirstName;
    private String authorLastName;
    private String authorProfilePhotoUrl;
    private String content;
    private Instant createdAt;
}
