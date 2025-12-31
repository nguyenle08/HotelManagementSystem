package com.hotel.room.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LockRoomRequest {
    private String reservationId;
    private String roomTypeId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
}
