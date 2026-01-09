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
  private java.util.List<String> images;
  // Optional reservation info when room is locked/occupied
  private String reservationId;
  private String guestName;
  private String checkInDate;
  private String checkOutDate;
}
