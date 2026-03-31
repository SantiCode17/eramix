package com.eramix.dto.group;

import lombok.*;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String profilePhotoUrl;
    private String role;
    private Instant joinedAt;
}
