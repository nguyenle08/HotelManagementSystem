package com.hotel.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReservationRequest {
    private String roomTypeId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numAdults;
    private Integer numChildren;
    private String specialRequests;
}
