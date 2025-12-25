package com.hotel.room.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    @Id
    private String roomId;
    
    private String roomTypeId;
    private String roomNumber;
    private Integer floor;
    private String status; // ACTIVE, MAINTENANCE, DECOMMISSIONED
}
