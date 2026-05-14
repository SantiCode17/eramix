package com.eramix.dto.community;

import com.eramix.entity.enums.CommunityCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCommunityRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String name;

    @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
    private String description;

    @NotNull(message = "La categoría es obligatoria")
    private CommunityCategory category;

    // Boolean (boxed) → Lombok generates getIsPublic()/setIsPublic() → Jackson maps "isPublic" correctly.
    // primitive boolean → getter isPublic() → Jackson uses "public" as key (BUG).
    @Builder.Default
    private Boolean isPublic = true;

    private String coverImageUrl;
}
