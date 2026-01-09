package com.hotel.reservation.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ReservationInfo {
  private String reservationId;
  private String guestFullName;
  private LocalDate checkInDate;
  private LocalDate checkOutDate;
}
