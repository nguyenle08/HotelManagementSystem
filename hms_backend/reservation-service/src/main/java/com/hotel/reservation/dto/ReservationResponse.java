package com.hotel.reservation.dto;

import com.hotel.reservation.entity.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {
    private String reservationId;
    private String reservationCode;
    private String userId;
    private String roomTypeId;
    private String roomTypeName;
    private String roomImage;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numAdults;
    private Integer numChildren;
    private BigDecimal totalAmount;
    private BigDecimal pricePerNight;
    private String specialRequests;
    private ReservationStatus status;
    private LocalDateTime createdAt;
}
