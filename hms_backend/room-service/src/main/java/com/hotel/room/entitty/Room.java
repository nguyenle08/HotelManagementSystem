package com.hotel.room.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "room_id", length = 36)
    private String roomId;

    @Column(name = "room_type_id", nullable = false, length = 36)
    private String roomTypeId;

    @Column(name = "room_number", unique = true, nullable = false, length = 10)
    private String roomNumber;

    @Column(nullable = false)
    private Integer floor;

    @Column(length = 20)
    private String status = "ACTIVE"; // ACTIVE, MAINTENANCE, DECOMMISSIONED
}