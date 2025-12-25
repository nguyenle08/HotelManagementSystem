package com.hotel.room.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailability {
    @Id
    private String availabilityId;
    
    private String roomId;
    private LocalDate date;
    private String status; // AVAILABLE, RESERVED, OCCUPIED, BLOCKED
    private String reservationId;
    private LocalDateTime updatedAt;
}
