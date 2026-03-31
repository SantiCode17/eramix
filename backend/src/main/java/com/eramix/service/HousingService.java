package com.eramix.service;

import com.eramix.dto.housing.*;
import com.eramix.entity.HousingPost;
import com.eramix.entity.User;
import com.eramix.entity.enums.HousingPostType;
import com.eramix.repository.HousingPostRepository;
import com.eramix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HousingService {

    private final HousingPostRepository postRepo;
    private final UserRepository userRepo;

    @Transactional
    public HousingPostResponse createPost(Long userId, CreateHousingPostRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        HousingPost p = new HousingPost();
        p.setUser(user);
        p.setTitle(req.getTitle());
        p.setDescription(req.getDescription());
        p.setCity(req.getCity());
        p.setAddress(req.getAddress());
        p.setMonthlyRent(req.getMonthlyRent());
        p.setCurrency(req.getCurrency() != null ? req.getCurrency() : "EUR");
        p.setAvailableFrom(LocalDate.parse(req.getAvailableFrom()));
        if (req.getAvailableUntil() != null) p.setAvailableUntil(LocalDate.parse(req.getAvailableUntil()));
        p.setRoomsAvailable(req.getRoomsAvailable());
        p.setPostType(HousingPostType.valueOf(req.getPostType()));
        p.setPhotoUrl(req.getPhotoUrl());
        p = postRepo.save(p);

        return mapPost(p);
    }

    @Transactional(readOnly = true)
    public List<HousingPostResponse> getAllActive() {
        return postRepo.findByActiveTrueOrderByCreatedAtDesc().stream().map(this::mapPost).toList();
    }

    @Transactional(readOnly = true)
    public List<HousingPostResponse> getByCity(String city) {
        return postRepo.findByCityIgnoreCaseAndActiveTrueOrderByCreatedAtDesc(city).stream().map(this::mapPost).toList();
    }

    @Transactional(readOnly = true)
    public List<HousingPostResponse> getMyPosts(Long userId) {
        return postRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId).stream().map(this::mapPost).toList();
    }

    @Transactional
    public void deactivatePost(Long userId, Long postId) {
        HousingPost post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUser().getId().equals(userId)) throw new RuntimeException("Not owner");
        post.setActive(false);
        postRepo.save(post);
    }

    private HousingPostResponse mapPost(HousingPost p) {
        return HousingPostResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .userFirstName(p.getUser().getFirstName())
                .userLastName(p.getUser().getLastName())
                .userProfilePhotoUrl(p.getUser().getProfilePhotoUrl())
                .title(p.getTitle())
                .description(p.getDescription())
                .city(p.getCity())
                .address(p.getAddress())
                .monthlyRent(p.getMonthlyRent())
                .currency(p.getCurrency())
                .availableFrom(p.getAvailableFrom().toString())
                .availableUntil(p.getAvailableUntil() != null ? p.getAvailableUntil().toString() : null)
                .roomsAvailable(p.getRoomsAvailable())
                .postType(p.getPostType().name())
                .photoUrl(p.getPhotoUrl())
                .active(p.isActive())
                .createdAt(p.getCreatedAt().toString())
                .build();
    }
}
