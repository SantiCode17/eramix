package com.eramix.dto.housing;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateHousingPostRequest {
    @NotBlank private String title;
    @NotBlank private String description;
    @NotBlank private String city;
    private String address;
    @NotNull private BigDecimal monthlyRent;
    private String currency = "EUR";
    @NotBlank private String availableFrom;
    private String availableUntil;
    private int roomsAvailable = 1;
    private String postType = "OFFER";
    private String photoUrl;
}
