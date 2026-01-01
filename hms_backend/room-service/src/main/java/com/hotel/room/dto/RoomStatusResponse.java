package com.hotel.room.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomStatusResponse {
  private String roomId;
  private String roomNumber;
  private Integer floor;
  private String status; // ACTIVE, MAINTENANCE, DECOMMISSIONED
  private String roomTypeId;
  private String roomTypeName;
}
