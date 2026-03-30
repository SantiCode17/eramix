package com.eramix.dto.social;

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
public class FriendRequestAction {

    @NotBlank(message = "La acción es obligatoria")
    @Pattern(regexp = "ACCEPTED|REJECTED|BLOCKED", message = "Acción inválida (ACCEPTED, REJECTED, BLOCKED)")
    private String action;
}
