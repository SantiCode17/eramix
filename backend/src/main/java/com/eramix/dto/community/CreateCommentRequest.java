package com.eramix.dto.community;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {

    @NotBlank(message = "Comment content is required")
    @Size(max = 1000, message = "Comment must be at most 1000 characters")
    private String content;
}
