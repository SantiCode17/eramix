package com.eramix.dto.group;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupRequest {

    @NotBlank(message = "El nombre del grupo es obligatorio")
    @Size(max = 200)
    private String name;

    @Size(max = 2000)
    private String description;

    private String avatarUrl;

    private Integer maxMembers;

    /** IDs de usuarios a añadir como miembros iniciales */
    private List<Long> memberIds;
}
