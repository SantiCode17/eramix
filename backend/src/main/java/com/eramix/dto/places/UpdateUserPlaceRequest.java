package com.eramix.dto.places;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateUserPlaceRequest {
    private String name;
    private String description;
    private String category;
    private String priority;
    private Boolean visited;
    private Integer rating;
    private String mapsUrl;
    private String notes;
    private LocalDate targetDate;
}
