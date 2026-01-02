package com.hotel.room.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class RoomTypeResponse {
    private String roomTypeId;
    private String name;
    private String description;
    private BigDecimal basePrice;
    private Integer maxGuests;
    private String bedType;
    private Double sizeSqm;
    private List<String> amenities;
    private List<String> images;
    private Boolean isActive;
    private Integer totalRooms;
    private Integer availableRooms;
}