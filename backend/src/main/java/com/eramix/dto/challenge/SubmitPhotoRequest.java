package com.eramix.dto.challenge;

import lombok.Data;

@Data
public class SubmitPhotoRequest {
    private String photoUrl;
    private String caption;
}
