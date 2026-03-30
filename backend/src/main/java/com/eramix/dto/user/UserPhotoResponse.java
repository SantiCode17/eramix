package com.eramix.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPhotoResponse {

    private Long id;
    private String photoUrl;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}
