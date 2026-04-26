package com.eramix.dto.ticketing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String ticketUuid;
    private Long eventId;
    private String eventTitle;
    private String qrPayload;
    private boolean isRedeemed;
    private String purchaseDate;
    private String redeemedAt;
}
