package com.hotel.room.dto;

import lombok.Data;

@Data
public class RoomSearchRequest {
    private String checkInDate;
    private String checkOutDate;
    private Integer guests;
}
