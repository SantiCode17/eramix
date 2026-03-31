package com.eramix.dto.community;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {

    @NotBlank(message = "Content is required")
    @Size(max = 2000, message = "Content must be at most 2000 characters")
    private String content;

    private String imageUrl;
}
