package com.eramix.dto.location;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartSharingRequest {

    @NotNull(message = "La latitud es obligatoria")
    @Min(-90) @Max(90)
    private Double latitude;

    @NotNull(message = "La longitud es obligatoria")
    @Min(-180) @Max(180)
    private Double longitude;

    /** Duration in minutes (default 30, max 120) */
    @Min(1) @Max(120)
    @Builder.Default
    private Integer durationMinutes = 30;
}
