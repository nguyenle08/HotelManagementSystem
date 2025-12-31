package com.hotel.reservation.dto;

import com.hotel.reservation.entity.PaymentStatus;
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
    
    // Pricing
    private BigDecimal baseAmount;
    private BigDecimal additionalCharges;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal pricePerNight;
    
    // Payment tracking
    private PaymentStatus paymentStatus;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    
    // Cancellation
    private String cancellationPolicy;
    private LocalDateTime canCancelUntil;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private BigDecimal cancellationFee;
    
    // Notes
    private String specialRequests;
    private String staffNotes;
    
    // Status
    private ReservationStatus status;
    
    private LocalDateTime createdAt;
}
