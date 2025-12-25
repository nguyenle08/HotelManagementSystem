package com.hotel.room.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomType {
    @Id
    private String roomTypeId;
    
    private String name;
    private String description;
    private BigDecimal basePrice;
    private Integer maxGuests;
    private String bedType;
    private BigDecimal sizeSqm;
    
    @Column(columnDefinition = "VARCHAR(5000)")
    private String amenities; // JSON string: ["WiFi", "TV", "AC"]
    
    @Column(columnDefinition = "VARCHAR(5000)")
    private String images; // JSON string: ["url1", "url2"]
    
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
