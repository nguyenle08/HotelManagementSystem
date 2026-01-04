package com.hotel.room.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeRequest {
    private String name;
    private String description;
    private BigDecimal basePrice;
    private Integer maxGuests;
    private String bedType;
    private Double sizeSqm;
    private List<String> amenities;
    private List<String> images;
}