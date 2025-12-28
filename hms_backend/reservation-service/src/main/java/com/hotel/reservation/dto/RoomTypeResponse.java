package com.hotel.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponse {
    private String roomTypeId;
    private String name;
    private String description;
    private BigDecimal basePrice;
    private Integer maxGuests;
    private String bedType;
    private BigDecimal sizeSqm;
    private List<String> amenities;
    private List<String> images;
    private Boolean isActive;
    private Integer availableRooms;
}
