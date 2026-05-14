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

    // Using Boolean (boxed) so Lombok generates getIsPublic() → Jackson serializes as "isPublic".
    // primitive boolean isPublic → getter isPublic() → Jackson strips "is" → emits "public" (BUG).
    private Boolean isPublic;

    private int memberCount;
    private Instant createdAt;

    private String currentUserRole;

    // Same: Boolean (boxed) → getIsMember() → Jackson emits "isMember" correctly.
    private Boolean isMember;

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
