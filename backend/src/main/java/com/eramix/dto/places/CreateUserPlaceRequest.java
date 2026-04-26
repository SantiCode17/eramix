package com.eramix.dto.places;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateUserPlaceRequest {
    private String name;
    private String description;
    private String category;
    private String priority;
    private String mapsUrl;
    private String notes;
    private LocalDate targetDate;
}
