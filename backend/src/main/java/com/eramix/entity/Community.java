package com.eramix.entity;

import com.eramix.entity.enums.CommunityCategory;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "community")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Community extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CommunityCategory category = CommunityCategory.GENERAL;

    @Column(name = "cover_image_url", length = 512)
    private String coverImageUrl;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = true;

    @Column(name = "member_count", nullable = false)
    @Builder.Default
    private Integer memberCount = 0;

    @OneToMany(mappedBy = "community", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CommunityMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "community", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @OrderBy("isPinned DESC, createdAt DESC")
    @Builder.Default
    private List<CommunityPost> posts = new ArrayList<>();
}
