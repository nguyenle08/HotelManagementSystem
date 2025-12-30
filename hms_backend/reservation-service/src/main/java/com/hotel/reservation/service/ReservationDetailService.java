package com.hotel.reservation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.reservation.dto.ReservationDetailResponse;
import com.hotel.reservation.dto.RoomTypeResponse;
import com.hotel.reservation.entity.Reservation;
import com.hotel.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ReservationDetailService {

  private final ReservationRepository reservationRepository;
  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;

  public ReservationDetailResponse getDetail(String reservationId, String userId) {

    Reservation reservation = reservationRepository.findById(reservationId)
      .orElseThrow(() -> new RuntimeException("Reservation not found"));

    if (!reservation.getUserId().equals(userId)) {
      throw new AccessDeniedException("Không có quyền truy cập");
    }

    RoomTypeResponse roomType = getRoomTypeInfo(reservation.getRoomTypeId());

    return toDetailResponse(reservation, roomType);
  }

  private ReservationDetailResponse toDetailResponse(
    Reservation r,
    RoomTypeResponse roomType
  ) {

    ReservationDetailResponse res = new ReservationDetailResponse();

    res.setReservationId(r.getReservationId());
    res.setReservationCode(r.getReservationCode());
    res.setUserId(r.getUserId());

    res.setRoomTypeId(r.getRoomTypeId());
    res.setRoomTypeName(roomType != null ? roomType.getName() : null);
    res.setRoomImage(
      roomType != null && roomType.getImages() != null && !roomType.getImages().isEmpty()
        ? roomType.getImages().get(0)
        : null
    );

    res.setCheckInDate(r.getCheckInDate());
    res.setCheckOutDate(r.getCheckOutDate());
    res.setNumAdults(r.getNumAdults());
    res.setNumChildren(r.getNumChildren());

    res.setPricePerNight(r.getPricePerNight());
    res.setTotalAmount(r.getTotalAmount());

    res.setStatus(r.getStatus());
    res.setPaymentStatus(r.getPaymentStatus());

    res.setGuestFullName(r.getGuestFullName());
    res.setGuestEmail(r.getGuestEmail());
    res.setGuestPhone(r.getGuestPhone());

    res.setSpecialRequests(r.getSpecialRequests());
    res.setCreatedAt(r.getCreatedAt());

    return res;
  }

  private RoomTypeResponse getRoomTypeInfo(String roomTypeId) {
    try {
      String url = "http://room-service/api/rooms/" + roomTypeId;
      String jsonResponse = restTemplate.getForObject(url, String.class);

      JsonNode root = objectMapper.readTree(jsonResponse);
      JsonNode dataNode = root.get("data");

      return dataNode != null
        ? objectMapper.treeToValue(dataNode, RoomTypeResponse.class)
        : null;

    } catch (Exception e) {
      System.err.println("Cannot fetch room type: " + e.getMessage());
      return null;
    }
  }
}
