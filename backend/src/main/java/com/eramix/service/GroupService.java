package com.eramix.service;

import com.eramix.dto.group.*;
import com.eramix.entity.*;
import com.eramix.entity.enums.GroupRole;
import com.eramix.entity.enums.MessageType;
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
public class GroupService {

    private final ChatGroupRepository chatGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupMessageRepository groupMessageRepository;
    private final UserRepository userRepository;

    // ─── CREATE GROUP ──────────────────────────────────────────────

    @Transactional
    public GroupResponse createGroup(Long creatorId, CreateGroupRequest request) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatGroup group = ChatGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .avatarUrl(request.getAvatarUrl())
                .creator(creator)
                .build();
        group = chatGroupRepository.save(group);

        // Add creator as ADMIN
        GroupMember creatorMember = GroupMember.builder()
                .group(group)
                .user(creator)
                .role(GroupRole.ADMIN)
                .joinedAt(Instant.now())
                .build();
        groupMemberRepository.save(creatorMember);

        // Add initial members
        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {
                if (!memberId.equals(creatorId)) {
                    User member = userRepository.findById(memberId).orElse(null);
                    if (member != null) {
                        GroupMember gm = GroupMember.builder()
                                .group(group)
                                .user(member)
                                .role(GroupRole.MEMBER)
                                .joinedAt(Instant.now())
                                .build();
                        groupMemberRepository.save(gm);
                    }
                }
            }
        }

        return toGroupResponse(group, creatorId);
    }

    // ─── GET MY GROUPS ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<GroupResponse> getMyGroups(Long userId) {
        List<ChatGroup> groups = chatGroupRepository.findAllByMemberUserId(userId);
        return groups.stream()
                .map(g -> toGroupResponse(g, userId))
                .collect(Collectors.toList());
    }

    // ─── GET GROUP BY ID ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public GroupResponse getGroupById(Long groupId, Long userId) {
        ChatGroup group = chatGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new RuntimeException("You are not a member of this group");
        }

        return toGroupResponse(group, userId);
    }

    // ─── ADD MEMBERS ───────────────────────────────────────────────

    @Transactional
    public GroupResponse addMembers(Long groupId, Long requesterId, List<Long> memberIds) {
        ChatGroup group = chatGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        GroupMember requester = groupMemberRepository.findByGroupIdAndUserId(groupId, requesterId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (requester.getRole() != GroupRole.ADMIN) {
            throw new RuntimeException("Only admins can add members");
        }

        int currentCount = chatGroupRepository.countMembers(groupId);
        int toAdd = 0;

        for (Long memberId : memberIds) {
            if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, memberId)) {
                if (currentCount + toAdd + 1 > group.getMaxMembers()) {
                    throw new RuntimeException("Group has reached maximum member limit");
                }
                User user = userRepository.findById(memberId)
                        .orElseThrow(() -> new RuntimeException("User not found: " + memberId));
                GroupMember gm = GroupMember.builder()
                        .group(group)
                        .user(user)
                        .role(GroupRole.MEMBER)
                        .joinedAt(Instant.now())
                        .build();
                groupMemberRepository.save(gm);
                toAdd++;
            }
        }

        return toGroupResponse(group, requesterId);
    }

    // ─── REMOVE MEMBER ─────────────────────────────────────────────

    @Transactional
    public void removeMember(Long groupId, Long requesterId, Long targetUserId) {
        GroupMember requester = groupMemberRepository.findByGroupIdAndUserId(groupId, requesterId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (requester.getRole() != GroupRole.ADMIN) {
            throw new RuntimeException("Only admins can remove members");
        }

        if (requesterId.equals(targetUserId)) {
            throw new RuntimeException("Admin cannot remove themselves. Use leave instead.");
        }

        groupMemberRepository.deleteByGroupIdAndUserId(groupId, targetUserId);
    }

    // ─── LEAVE GROUP ───────────────────────────────────────────────

    @Transactional
    public void leaveGroup(Long groupId, Long userId) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (member.getRole() == GroupRole.ADMIN) {
            // Check if there are other admins
            List<GroupMember> members = groupMemberRepository.findAllByGroupId(groupId);
            long adminCount = members.stream()
                    .filter(m -> m.getRole() == GroupRole.ADMIN)
                    .count();

            if (adminCount <= 1 && members.size() > 1) {
                // Promote the next member to admin
                members.stream()
                        .filter(m -> !m.getUser().getId().equals(userId))
                        .findFirst()
                        .ifPresent(m -> {
                            m.setRole(GroupRole.ADMIN);
                            groupMemberRepository.save(m);
                        });
            }
        }

        groupMemberRepository.deleteByGroupIdAndUserId(groupId, userId);

        // If no members left, deactivate group
        int remaining = chatGroupRepository.countMembers(groupId);
        if (remaining == 0) {
            ChatGroup group = chatGroupRepository.findById(groupId).orElse(null);
            if (group != null) {
                group.setIsActive(false);
                chatGroupRepository.save(group);
            }
        }
    }

    // ─── GET GROUP MESSAGES ────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<GroupMessageResponse> getGroupMessages(Long groupId, Long userId, int page, int size) {
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new RuntimeException("You are not a member of this group");
        }

        return groupMessageRepository.findAllByGroupIdOrderByCreatedAtDesc(groupId, PageRequest.of(page, size))
                .map(this::toGroupMessageResponse);
    }

    // ─── SEND GROUP MESSAGE ────────────────────────────────────────

    @Transactional
    public GroupMessageResponse sendGroupMessage(Long senderId, SendGroupMessageRequest request) {
        ChatGroup group = chatGroupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!groupMemberRepository.existsByGroupIdAndUserId(request.getGroupId(), senderId)) {
            throw new RuntimeException("You are not a member of this group");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupMessage message = GroupMessage.builder()
                .group(group)
                .sender(sender)
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : MessageType.TEXT)
                .mediaUrl(request.getMediaUrl())
                .build();
        message = groupMessageRepository.save(message);

        return toGroupMessageResponse(message);
    }

    // ─── MARK AS READ ──────────────────────────────────────────────

    @Transactional
    public void markGroupAsRead(Long groupId, Long userId) {
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        groupMessageRepository.findLastMessageByGroupId(groupId)
                .ifPresent(lastMsg -> {
                    member.setLastReadMessageId(lastMsg.getId());
                    groupMemberRepository.save(member);
                });
    }

    // ─── GET GROUP MEMBER IDS (for WebSocket broadcast) ────────────

    @Transactional(readOnly = true)
    public List<Long> getGroupMemberIds(Long groupId) {
        return groupMemberRepository.findAllByGroupId(groupId).stream()
                .map(m -> m.getUser().getId())
                .collect(Collectors.toList());
    }

    // ─── MAPPERS ───────────────────────────────────────────────────

    private GroupResponse toGroupResponse(ChatGroup group, Long currentUserId) {
        List<GroupMember> members = groupMemberRepository.findAllByGroupId(group.getId());

        GroupMessage lastMsg = groupMessageRepository.findLastMessageByGroupId(group.getId()).orElse(null);

        int unreadCount = 0;
        GroupMember currentMember = members.stream()
                .filter(m -> m.getUser().getId().equals(currentUserId))
                .findFirst()
                .orElse(null);

        if (currentMember != null && currentMember.getLastReadMessageId() != null) {
            unreadCount = groupMessageRepository.countUnreadMessages(group.getId(), currentMember.getLastReadMessageId());
        } else if (currentMember != null) {
            unreadCount = groupMessageRepository.countAllByGroupId(group.getId());
        }

        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .avatarUrl(group.getAvatarUrl())
                .creatorId(group.getCreator().getId())
                .memberCount(members.size())
                .maxMembers(group.getMaxMembers())
                .isActive(group.getIsActive())
                .createdAt(group.getCreatedAt())
                .lastMessage(lastMsg != null ? lastMsg.getContent() : null)
                .lastMessageAt(lastMsg != null ? lastMsg.getCreatedAt() : null)
                .unreadCount((long) unreadCount)
                .members(members.stream().map(m -> GroupMemberResponse.builder()
                        .userId(m.getUser().getId())
                        .firstName(m.getUser().getFirstName())
                        .lastName(m.getUser().getLastName())
                        .profilePhotoUrl(m.getUser().getProfilePhotoUrl())
                        .role(m.getRole().name())
                        .joinedAt(m.getJoinedAt())
                        .build()).collect(Collectors.toList()))
                .build();
    }

    private GroupMessageResponse toGroupMessageResponse(GroupMessage message) {
        return GroupMessageResponse.builder()
                .id(message.getId())
                .groupId(message.getGroup().getId())
                .senderId(message.getSender().getId())
                .senderFirstName(message.getSender().getFirstName())
                .senderLastName(message.getSender().getLastName())
                .senderProfilePhotoUrl(message.getSender().getProfilePhotoUrl())
                .content(message.getContent())
                .type(message.getType())
                .mediaUrl(message.getMediaUrl())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
