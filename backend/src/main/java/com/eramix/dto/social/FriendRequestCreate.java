package com.eramix.dto.social;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestCreate {

    @NotNull(message = "El ID del receptor es obligatorio")
    private Long receiverId;
}
