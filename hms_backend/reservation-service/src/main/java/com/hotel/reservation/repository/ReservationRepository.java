package com.hotel.reservation.repository;

import com.hotel.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {
    List<Reservation> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Object> findByReservationIdAndUserId(String reservationId, String userId);

  List<Reservation> findByCheckInDateOrCheckOutDate(LocalDate checkInDate, LocalDate checkOutDate);
}
