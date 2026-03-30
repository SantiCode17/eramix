package com.eramix.dto.social;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipResponse {

    private Long friendshipId;
    private Long friendId;
    private String friendFirstName;
    private String friendLastName;
    private String friendProfilePhotoUrl;
    private String friendDestinationCity;
    private String friendDestinationCountry;
    private LocalDateTime friendsSince;
}
