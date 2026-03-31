package com.eramix.dto.housing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder @AllArgsConstructor
public class HousingPostResponse {
    private Long id;
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private String userProfilePhotoUrl;
    private String title;
    private String description;
    private String city;
    private String address;
    private BigDecimal monthlyRent;
    private String currency;
    private String availableFrom;
    private String availableUntil;
    private int roomsAvailable;
    private String postType;
    private String photoUrl;
    private boolean active;
    private String createdAt;
}
