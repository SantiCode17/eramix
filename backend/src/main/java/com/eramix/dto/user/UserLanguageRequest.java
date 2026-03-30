package com.eramix.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLanguageRequest {

    @NotNull(message = "El ID del idioma es obligatorio")
    private Long languageId;

    @NotBlank(message = "El nivel de competencia es obligatorio")
    private String proficiencyLevel;
}
