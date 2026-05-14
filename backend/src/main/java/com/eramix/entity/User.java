package com.eramix.entity;

import com.eramix.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@NamedEntityGraph(
        name = "User.profile",
        attributeNodes = {
                @NamedAttributeNode("homeUniversity"),
                @NamedAttributeNode("hostUniversity"),
                @NamedAttributeNode("interests"),
                @NamedAttributeNode("userLanguages"),
                @NamedAttributeNode("photos")
        }
)
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "profile_photo_url", length = 512)
    private String profilePhotoUrl;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_university_id")
    private University homeUniversity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_university_id")
    private University hostUniversity;

    @Column(name = "destination_city", length = 150)
    private String destinationCity;

    @Column(name = "destination_country", length = 100)
    private String destinationCountry;

    @Column(name = "mobility_start")
    private LocalDate mobilityStart;

    @Column(name = "mobility_end")
    private LocalDate mobilityEnd;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "location_updated_at")
    private Instant locationUpdatedAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "last_seen")
    private Instant lastSeen;

    @Column(name = "auth_provider", nullable = false, length = 20)
    @Builder.Default
    private String authProvider = "LOCAL";

    @Column(name = "provider_id")
    private String providerId;

    @Column(name = "degree", length = 150)
    private String degree;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "looking_for_gender", length = 20)
    private String lookingForGender;

    @Column(name = "show_gender_on_profile", nullable = false)
    @Builder.Default
    private Boolean showGenderOnProfile = true;

    @Column(name = "notifications_enabled", nullable = false)
    @Builder.Default
    private Boolean notificationsEnabled = false;

    @Column(name = "budget_alerts_enabled", nullable = false)
    @Builder.Default
    private Boolean budgetAlertsEnabled = true;

    @Column(name = "budget_alert_threshold", nullable = false)
    @Builder.Default
    private Integer budgetAlertThreshold = 75;

    @Column(name = "why_am_i_here", length = 100)
    private String whyAmIHere;

    @Column(name = "favorite_song", length = 255)
    private String favoriteSong;

    @Column(name = "favorite_food", length = 255)
    private String favoriteFood;

    @Column(name = "special_hobby", length = 255)
    private String specialHobby;

    @Column(name = "custom_prompts", columnDefinition = "JSON")
    private String customPrompts;

    @Column(name = "social_instagram", length = 255)
    private String socialInstagram;

    @Column(name = "social_tiktok", length = 255)
    private String socialTiktok;

    @Column(name = "height")
    private Integer height;

    @Column(name = "zodiac", length = 50)
    private String zodiac;

    @Column(name = "profession", length = 150)
    private String profession;

    // --- Relationships ---

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_interest",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "interest_id")
    )
    @Builder.Default
    private Set<Interest> interests = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<UserLanguage> userLanguages = new HashSet<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private Set<UserPhoto> photos = new HashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_intention", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "intention")
    @Builder.Default
    private Set<String> intentions = new HashSet<>();
}
