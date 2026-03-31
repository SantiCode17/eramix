package com.eramix.dto.community;

import com.eramix.entity.enums.CommunityCategory;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityResponse {

    private Long id;
    private String name;
    private String description;
    private CommunityCategory category;
    private String coverImageUrl;
    private boolean isPublic;
    private int memberCount;
    private Instant createdAt;

    // Current user's role in this community (null if not a member)
    private String currentUserRole;
    private boolean isMember;

    // Preview of some members
    private List<MemberPreview> membersPreview;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberPreview {
        private Long userId;
        private String firstName;
        private String lastName;
        private String profilePhotoUrl;
    }
}
