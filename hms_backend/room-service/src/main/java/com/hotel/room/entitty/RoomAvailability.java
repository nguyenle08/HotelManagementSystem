package com.hotel.room.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailability {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "availability_id", length = 36)
    private String availabilityId;

    @Column(name = "room_id", nullable = false, length = 36)
    private String roomId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 20)
    private String status; // AVAILABLE, RESERVED, OCCUPIED, BLOCKED

    @Column(name = "reservation_id", length = 36)
    private String reservationId;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}