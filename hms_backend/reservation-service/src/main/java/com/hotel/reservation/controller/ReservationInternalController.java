package com.hotel.reservation.controller;

import com.hotel.reservation.dto.ReservationInfo;
import com.hotel.reservation.entity.Reservation;
import com.hotel.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/reservations")
@RequiredArgsConstructor
public class ReservationInternalController {

  private final ReservationRepository reservationRepository;

  @GetMapping("/{reservationId}")
  public ReservationInfo getReservationInfo(@PathVariable String reservationId) {
    Reservation r = reservationRepository.findById(reservationId)
      .orElseThrow(() -> new RuntimeException("Reservation not found"));

    ReservationInfo info = new ReservationInfo();
    info.setReservationId(r.getReservationId());
    info.setGuestFullName(r.getGuestFullName());
    info.setCheckInDate(r.getCheckInDate());
    info.setCheckOutDate(r.getCheckOutDate());
    return info;
  }
}
