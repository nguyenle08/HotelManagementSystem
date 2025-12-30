package com.hotel.reservation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.reservation.client.UserServiceClient;
import com.hotel.reservation.dto.CreateReservationRequest;
import com.hotel.reservation.dto.ReservationResponse;
import com.hotel.reservation.dto.RoomTypeResponse;
import com.hotel.reservation.dto.UserProfileResponse;
import com.hotel.reservation.entity.PaymentStatus;
import com.hotel.reservation.entity.Reservation;
import com.hotel.reservation.entity.ReservationStatus;
import com.hotel.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

  private final ReservationRepository reservationRepository;
  private final RestTemplate restTemplate;
  private final UserServiceClient userServiceClient;
  private final ObjectMapper objectMapper = new ObjectMapper();

  public ReservationResponse createReservation( CreateReservationRequest request, String userId, String authHeader) {

    validateDates(request.getCheckInDate(), request.getCheckOutDate());

    RoomTypeResponse roomType = getRoomTypeInfo(request.getRoomTypeId());
    if (roomType == null) {
      throw new RuntimeException("Loại phòng không tồn tại");
    }

    long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());

    BigDecimal subtotal = roomType.getBasePrice().multiply(BigDecimal.valueOf(nights));

    BigDecimal taxRate = BigDecimal.valueOf(0.1);
    BigDecimal taxAmount = subtotal.multiply(taxRate);

    BigDecimal totalAmount = subtotal.add(taxAmount);

    Reservation reservation = new Reservation();
    reservation.setUserId(userId);
    reservation.setRoomTypeId(request.getRoomTypeId());
    reservation.setRoomTypeName(roomType.getName());
    reservation.setReservationCode(generateReservationCode());
    reservation.setCheckInDate(request.getCheckInDate());
    reservation.setCheckOutDate(request.getCheckOutDate());
    reservation.setNumAdults(request.getNumAdults() != null ? request.getNumAdults() : 1);
    reservation.setNumChildren(request.getNumChildren() != null ? request.getNumChildren() : 0);
    reservation.setSpecialRequests(request.getSpecialRequests());
    reservation.setPricePerNight(roomType.getBasePrice());
    reservation.setTotalAmount(totalAmount);
    reservation.setStatus(ReservationStatus.PENDING);

    UserProfileResponse user = null;

    try {
      // Sử dụng OpenFeign để gọi Internal User Service (không cần token)
      user = userServiceClient.getUserProfile(userId);
    } catch (Exception e) {
      System.err.println("Cannot fetch user info from auth-service: " + e.getMessage());
    }

    if (user != null) {
      reservation.setGuestFullName(user.getFullName());
      reservation.setGuestEmail(user.getEmail());
      reservation.setGuestPhone(
        user.getPhone() != null ? user.getPhone() : ""
      );
    } else {
      reservation.setGuestFullName("Unknown");
      reservation.setGuestEmail("unknown@example.com");
      reservation.setGuestPhone("");
    }

    Reservation saved = reservationRepository.save(reservation);

    return toResponse(saved, roomType);
  }

  private String generateReservationCode() {
    String year = String.valueOf(LocalDate.now().getYear());
    String shortId = UUID.randomUUID()
      .toString()
      .substring(0, 4)
      .toUpperCase();

    return "BK-" + year + "-" + shortId;
  }

  public List<ReservationResponse> getUserReservations(String userId) {
    return reservationRepository.findByUserIdOrderByCreatedAtDesc(userId)
      .stream()
      .map(r -> {
        RoomTypeResponse roomType = getRoomTypeInfo(r.getRoomTypeId());
        return toResponse(r, roomType);
      })
      .collect(Collectors.toList());
  }

  @Transactional
  public void cancelReservation(String reservationId, String userId) {
    Reservation reservation = (Reservation) reservationRepository
      .findByReservationIdAndUserId(reservationId, userId)
      .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

    if (!ReservationStatus.PENDING.equals(reservation.getStatus())) {
      throw new IllegalStateException("Cannot cancel reservation: status is not PENDING");
    }

    if (!PaymentStatus.PENDING.equals(reservation.getPaymentStatus())) {
      throw new IllegalStateException("Cannot cancel reservation: payment is already processed");
    }

    reservation.setStatus(ReservationStatus.CANCELLED);

    reservationRepository.save(reservation);
  }

  private void validateDates(LocalDate checkIn, LocalDate checkOut) {
    LocalDate today = LocalDate.now();

    if (checkIn == null || checkOut == null) {
      throw new RuntimeException("Ngày check-in và check-out không được để trống");
    }

    if (checkIn.isBefore(today)) {
      throw new RuntimeException("Ngày check-in không được ở quá khứ");
    }

    if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
      throw new RuntimeException("Ngày check-out phải sau ngày check-in");
    }
  }

  private RoomTypeResponse getRoomTypeInfo(String roomTypeId) {
    try {
      String url = "http://room-service/api/rooms/" + roomTypeId;
      String jsonResponse = restTemplate.getForObject(url, String.class);

      JsonNode root = objectMapper.readTree(jsonResponse);
      JsonNode dataNode = root.get("data");

      if (dataNode != null) {
        return objectMapper.treeToValue(dataNode, RoomTypeResponse.class);
      }
      return null;
    } catch (Exception e) {
      System.err.println("Error fetching room type: " + e.getMessage());
      e.printStackTrace();
      return null;
    }
  }

  private ReservationResponse toResponse(Reservation r, RoomTypeResponse roomType) {
    return new ReservationResponse(
      r.getReservationId(),
      r.getReservationCode(),
      r.getUserId(),
      r.getRoomTypeId(),
      roomType != null ? roomType.getName() : null,
      roomType != null && roomType.getImages() != null && !roomType.getImages().isEmpty()
        ? roomType.getImages().get(0)
        : null,
      r.getCheckInDate(),
      r.getCheckOutDate(),
      r.getNumAdults(),
      r.getNumChildren(),
      r.getTotalAmount(),
      r.getPricePerNight(),
      r.getSpecialRequests(),
      r.getStatus(),
      r.getCreatedAt()
    );
  }

}
