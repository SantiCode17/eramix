package com.eramix.dto.user;

import lombok.Data;
import java.util.List;

@Data
public class PhotoReorderRequest {
    private List<PhotoOrderEntry> photoOrders;
}
