package com.hotel.reservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "reservation_id", length = 36)
    private String reservationId;

    @Column(name = "reservation_code", unique = true, length = 20)
    private String reservationCode;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "guest_id", length = 36)
    private String guestId;

    @Column(name = "room_type_id", nullable = false, length = 36)
    private String roomTypeId;

    @Column(name = "room_type_name", length = 100)
    private String roomTypeName;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(name = "num_adults")
    private Integer numAdults = 1;

    @Column(name = "num_children")
    private Integer numChildren = 0;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "price_per_night", precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReservationStatus status = ReservationStatus.PENDING;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

  @Column(name = "guest_full_name", nullable = false)
  private String guestFullName;

  @Column(name = "guest_email", nullable = false)
  private String guestEmail;

  @Column(name = "guest_phone", nullable = false)
  private String guestPhone;

  @Enumerated(EnumType.STRING)
  @Column(name = "payment_status", nullable = false, length = 20)
  private PaymentStatus paymentStatus = PaymentStatus.PENDING;

}
