package com.eramix.dto.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipantRequest {

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "GOING|INTERESTED|NOT_GOING", message = "Estado inválido (GOING, INTERESTED, NOT_GOING)")
    private String status;
}
