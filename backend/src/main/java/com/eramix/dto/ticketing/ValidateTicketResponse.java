package com.eramix.dto.ticketing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateTicketResponse {
    private boolean valid;
    private String message;
    private String ticketUuid;
    private String holderName;
    private String eventTitle;
}
