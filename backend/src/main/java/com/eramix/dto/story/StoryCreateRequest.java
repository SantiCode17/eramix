package com.eramix.dto.story;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoryCreateRequest {

    @NotBlank(message = "La URL del media es obligatoria")
    private String mediaUrl;

    @Size(max = 500, message = "El caption no puede superar 500 caracteres")
    private String caption;
}
