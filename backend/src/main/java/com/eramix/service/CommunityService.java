package com.eramix.service;

import com.eramix.dto.community.*;
import com.eramix.entity.*;
import com.eramix.entity.enums.CommunityCategory;
import com.eramix.entity.enums.CommunityMemberStatus;
import com.eramix.entity.enums.CommunityRole;
import com.eramix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;
    private final CommunityPostRepository communityPostRepository;
    private final CommunityCommentRepository communityCommentRepository;
    private final CommunityPostLikeRepository communityPostLikeRepository;
    private final UserRepository userRepository;

    // ─── GET COMMUNITIES ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CommunityResponse> getCommunities(CommunityCategory category, String query, Long userId) {
        List<Community> communities;

        if (category != null && query != null && !query.isBlank()) {
            communities = communityRepository.searchByCategoryAndName(category, query);
        } else if (category != null) {
            communities = communityRepository.findByCategory(category);
        } else if (query != null && !query.isBlank()) {
            communities = communityRepository.searchByName(query);
        } else {
            communities = communityRepository.findAll();
        }

        return communities.stream()
                .map(c -> toCommunityResponse(c, userId))
                .collect(Collectors.toList());
    }

    // ─── GET MY COMMUNITIES ────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CommunityResponse> getMyCommunities(Long userId) {
        return communityRepository.findAllByMemberUserIdAndStatus(userId, CommunityMemberStatus.ACTIVE).stream()
                .map(c -> toCommunityResponse(c, userId))
                .collect(Collectors.toList());
    }

    // ─── GET SUGGESTED COMMUNITIES ─────────────────────────────────

    @Transactional(readOnly = true)
    public List<CommunityResponse> getSuggestedCommunities(Long userId) {
        return communityRepository.findSuggestedForUser(userId).stream()
                .limit(10)
                .map(c -> toCommunityResponse(c, userId))
                .collect(Collectors.toList());
    }

    // ─── GET COMMUNITY BY ID ───────────────────────────────────────

    @Transactional(readOnly = true)
    public CommunityResponse getCommunityById(Long communityId, Long userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found"));
        return toCommunityResponse(community, userId);
    }
    
    @Transactional(readOnly = true)
    public List<CommunityResponse.MemberPreview> getCommunityMembers(Long communityId) {
        return communityMemberRepository
                .findAllByCommunityIdAndStatus(communityId, CommunityMemberStatus.ACTIVE)
                .stream()
                .map(m -> CommunityResponse.MemberPreview.builder()
                        .userId(m.getUser().getId())
                        .firstName(m.getUser().getFirstName())
                        .lastName(m.getUser().getLastName())
                        .profilePhotoUrl(m.getUser().getProfilePhotoUrl())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── JOIN COMMUNITY ────────────────────────────────────────────

    @Transactional
    public CommunityResponse joinCommunity(Long communityId, Long userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found"));

        // Check existing membership
        java.util.Optional<CommunityMember> existingOpt =
                communityMemberRepository.findByCommunityIdAndUserId(communityId, userId);

        if (existingOpt.isPresent()) {
            CommunityMember existing = existingOpt.get();
            if (existing.getStatus() == CommunityMemberStatus.ACTIVE) {
                // Already a member — return idempotently (no error)
                return toCommunityResponse(community, userId);
            }
            // PENDING + public → activate now
            if (community.getIsPublic()) {
                existing.setStatus(CommunityMemberStatus.ACTIVE);
                communityMemberRepository.save(existing);
                community.setMemberCount(community.getMemberCount() + 1);
                communityRepository.save(community);
            }
            return toCommunityResponse(community, userId);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CommunityMemberStatus status = community.getIsPublic()
                ? CommunityMemberStatus.ACTIVE
                : CommunityMemberStatus.PENDING;

        CommunityMember member = CommunityMember.builder()
                .community(community)
                .user(user)
                .role(CommunityRole.MEMBER)
                .status(status)
                .joinedAt(Instant.now())
                .build();
        communityMemberRepository.save(member);

        if (status == CommunityMemberStatus.ACTIVE) {
            community.setMemberCount(community.getMemberCount() + 1);
            communityRepository.save(community);
        }

        return toCommunityResponse(community, userId);
    }

    // ─── LEAVE COMMUNITY ───────────────────────────────────────────

    @Transactional
    public void leaveCommunity(Long communityId, Long userId) {
        CommunityMember member = communityMemberRepository.findByCommunityIdAndUserId(communityId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this community"));

        communityMemberRepository.delete(member);

        if (member.getStatus() == CommunityMemberStatus.ACTIVE) {
            Community community = communityRepository.findById(communityId).orElse(null);
            if (community != null && community.getMemberCount() > 0) {
                community.setMemberCount(community.getMemberCount() - 1);
                communityRepository.save(community);
            }
        }
    }

    // ─── GET POSTS ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<CommunityPostResponse> getCommunityPosts(Long communityId, Long userId, int page, int size) {
        return communityPostRepository
                .findAllByCommunityIdOrderByIsPinnedDescCreatedAtDesc(communityId, PageRequest.of(page, size))
                .map(post -> toPostResponse(post, userId));
    }

    // ─── CREATE POST ───────────────────────────────────────────────

    @Transactional
    public CommunityPostResponse createPost(Long communityId, Long userId, CreatePostRequest request) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found"));

        if (!communityMemberRepository.existsByCommunityIdAndUserIdAndStatus(communityId, userId, CommunityMemberStatus.ACTIVE)) {
            throw new IllegalArgumentException("Debes ser miembro de la comunidad para publicar");
        }

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CommunityPost post = CommunityPost.builder()
                .community(community)
                .author(author)
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .build();
        post = communityPostRepository.save(post);

        return toPostResponse(post, userId);
    }

    // ─── LIKE/UNLIKE POST ──────────────────────────────────────────

    @Transactional
    public CommunityPostResponse toggleLike(Long communityId, Long postId, Long userId) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getCommunity().getId().equals(communityId)) {
            throw new RuntimeException("Post does not belong to this community");
        }

        boolean alreadyLiked = communityPostLikeRepository.existsByPostIdAndUserId(postId, userId);

        if (alreadyLiked) {
            communityPostLikeRepository.deleteByPostIdAndUserId(postId, userId);
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            CommunityPostLike like = CommunityPostLike.builder()
                    .post(post)
                    .user(user)
                    .build();
            communityPostLikeRepository.save(like);
            post.setLikeCount(post.getLikeCount() + 1);
        }

        post = communityPostRepository.save(post);
        return toPostResponse(post, userId);
    }

    // ─── CREATE COMMENT ────────────────────────────────────────────

    @Transactional
    public CommunityCommentResponse createComment(Long communityId, Long postId, Long userId, CreateCommentRequest request) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getCommunity().getId().equals(communityId)) {
            throw new RuntimeException("Post does not belong to this community");
        }

        if (!communityMemberRepository.existsByCommunityIdAndUserIdAndStatus(communityId, userId, CommunityMemberStatus.ACTIVE)) {
            throw new IllegalArgumentException("Debes ser miembro de la comunidad para comentar");
        }

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CommunityComment comment = CommunityComment.builder()
                .post(post)
                .author(author)
                .content(request.getContent())
                .build();
        comment = communityCommentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        communityPostRepository.save(post);

        return toCommentResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<CommunityCommentResponse> getPostComments(Long communityId, Long postId, Long userId) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getCommunity().getId().equals(communityId)) {
            throw new RuntimeException("Post does not belong to this community");
        }
        
        List<CommunityComment> comments = communityCommentRepository.findAllByPostIdOrderByCreatedAtAsc(postId);
        return comments.stream().map(this::toCommentResponse).collect(Collectors.toList());
    }

    // ─── CREATE COMMUNITY (user-facing) ───────────────────────────

    @Transactional
    public CommunityResponse createCommunity(Long userId, CreateCommunityRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Community community = Community.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .coverImageUrl(request.getCoverImageUrl())
                .build();
        community = communityRepository.save(community);

        // Creator becomes ADMIN member automatically
        CommunityMember member = CommunityMember.builder()
                .community(community)
                .user(user)
                .role(CommunityRole.ADMIN)
                .status(CommunityMemberStatus.ACTIVE)
                .joinedAt(Instant.now())
                .build();
        communityMemberRepository.save(member);

        community.setMemberCount(1);
        communityRepository.save(community);

        return toCommunityResponse(community, userId);
    }

    // ─── AUTO-CREATE COMMUNITY ─────────────────────────────────────

    @Transactional
    public Community getOrCreateCommunity(String name, CommunityCategory category, String description) {
        return communityRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> {
                    Community community = Community.builder()
                            .name(name)
                            .description(description)
                            .category(category)
                            .isPublic(true)
                            .build();
                    return communityRepository.save(community);
                });
    }

    @Transactional
    public void addMemberToCommunity(Long communityId, Long userId) {
        if (communityMemberRepository.existsByCommunityIdAndUserId(communityId, userId)) {
            return;
        }

        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CommunityMember member = CommunityMember.builder()
                .community(community)
                .user(user)
                .role(CommunityRole.MEMBER)
                .status(CommunityMemberStatus.ACTIVE)
                .joinedAt(Instant.now())
                .build();
        communityMemberRepository.save(member);

        community.setMemberCount(community.getMemberCount() + 1);
        communityRepository.save(community);
    }

    // ─── MAPPERS ───────────────────────────────────────────────────

    private CommunityResponse toCommunityResponse(Community community, Long userId) {
        CommunityMember currentMember = communityMemberRepository
                .findByCommunityIdAndUserId(community.getId(), userId)
                .orElse(null);

        List<CommunityMember> membersPreview = communityMemberRepository
                .findAllByCommunityIdAndStatus(community.getId(), CommunityMemberStatus.ACTIVE)
                .stream().limit(5).collect(Collectors.toList());

        return CommunityResponse.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .category(community.getCategory())
                .coverImageUrl(community.getCoverImageUrl())
                .isPublic(community.getIsPublic())
                .memberCount(community.getMemberCount())
                .createdAt(community.getCreatedAt())
                .currentUserRole(currentMember != null ? currentMember.getRole().name() : null)
                .isMember(currentMember != null && currentMember.getStatus() == CommunityMemberStatus.ACTIVE)
                .membersPreview(membersPreview.stream().map(m ->
                        CommunityResponse.MemberPreview.builder()
                                .userId(m.getUser().getId())
                                .firstName(m.getUser().getFirstName())
                                .lastName(m.getUser().getLastName())
                                .profilePhotoUrl(m.getUser().getProfilePhotoUrl())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }

    private CommunityPostResponse toPostResponse(CommunityPost post, Long userId) {
        boolean liked = communityPostLikeRepository.existsByPostIdAndUserId(post.getId(), userId);
        List<CommunityComment> recentComments = communityCommentRepository.findTop3ByPostIdOrderByCreatedAtDesc(post.getId());

        return CommunityPostResponse.builder()
                .id(post.getId())
                .communityId(post.getCommunity().getId())
                .authorId(post.getAuthor().getId())
                .authorFirstName(post.getAuthor().getFirstName())
                .authorLastName(post.getAuthor().getLastName())
                .authorProfilePhotoUrl(post.getAuthor().getProfilePhotoUrl())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .isPinned(post.getIsPinned())
                .likedByCurrentUser(liked)
                .createdAt(post.getCreatedAt())
                .recentComments(recentComments.stream()
                        .map(this::toCommentResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private CommunityCommentResponse toCommentResponse(CommunityComment comment) {
        return CommunityCommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .authorId(comment.getAuthor().getId())
                .authorFirstName(comment.getAuthor().getFirstName())
                .authorLastName(comment.getAuthor().getLastName())
                .authorProfilePhotoUrl(comment.getAuthor().getProfilePhotoUrl())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
