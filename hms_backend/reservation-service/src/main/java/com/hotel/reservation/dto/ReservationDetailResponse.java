package com.hotel.reservation.dto;

import com.hotel.reservation.entity.PaymentStatus;
import com.hotel.reservation.entity.ReservationStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDetailResponse {
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
  private BigDecimal pricePerNight;
  private BigDecimal totalAmount;
  private String specialRequests;
  private ReservationStatus status;
  private String guestFullName;
  private String guestEmail;
  private String guestPhone;
  private PaymentStatus paymentStatus;
  private LocalDateTime createdAt;
}
