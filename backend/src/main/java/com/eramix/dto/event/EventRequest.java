package com.eramix.dto.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRequest {

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 200)
    private String title;

    @Size(max = 2000)
    private String description;

    @Size(max = 100)
    private String category;

    @Size(max = 255)
    private String location;

    private Double latitude;
    private Double longitude;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDateTime startDatetime;

    private LocalDateTime endDatetime;

    private Integer maxParticipants;

    @Builder.Default
    private Boolean isPublic = true;
}
