package com.hotel.room.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomRequest {
  private String roomNumber;
  private Integer floor;
  private String status; // ACTIVE, MAINTENANCE, DECOMMISSIONED
  private String roomTypeId;
}
