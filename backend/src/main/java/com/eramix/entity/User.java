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
}
