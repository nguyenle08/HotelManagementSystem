package com.hotel.reservation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.reservation.client.UserServiceClient;
import com.hotel.reservation.dto.*;
import com.hotel.reservation.dto.dashboard.*;
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
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
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

    BigDecimal baseAmount = roomType.getBasePrice().multiply(BigDecimal.valueOf(nights));
    BigDecimal totalAmount = baseAmount; // Có thể thêm tax/fees sau

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

    // Set pricing
    reservation.setBaseAmount(baseAmount);
    reservation.setTotalAmount(totalAmount);

    // ⭐ KEY: Tự động CONFIRMED, không cần Staff xác nhận
    reservation.setStatus(ReservationStatus.CONFIRMED);

    // Payment status = UNPAID (khách có thể thanh toán sau)
    reservation.setPaymentStatus(PaymentStatus.UNPAID);
    reservation.setPaidAmount(BigDecimal.ZERO);

    // Chính sách hủy: Miễn phí trước 24h
    reservation.setCancellationPolicy("FREE_24H");
    LocalDateTime cancelDeadline = request.getCheckInDate()
      .atStartOfDay()
      .minusHours(24);
    reservation.setCanCancelUntil(cancelDeadline);

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

    // Lock rooms trong room-service
    try {
      lockRoomsForReservation(saved.getReservationId(), saved.getRoomTypeId(),
        saved.getCheckInDate(), saved.getCheckOutDate());
    } catch (Exception e) {
      // Rollback reservation nếu không lock được phòng
      reservationRepository.delete(saved);
      throw new RuntimeException("Không thể khóa phòng: " + e.getMessage());
    }

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

  // Get all reservations for staff/admin
  public List<ReservationResponse> getAllReservations() {
    return reservationRepository.findAll()
      .stream()
      .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
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

    // Chỉ cho phép hủy nếu đang CONFIRMED
    if (!ReservationStatus.CONFIRMED.equals(reservation.getStatus())) {
      throw new IllegalStateException("Cannot cancel reservation: status is " + reservation.getStatus());
    }

    // Kiểm tra còn trong thời gian hủy miễn phí không
    LocalDateTime now = LocalDateTime.now();
    BigDecimal cancellationFee = BigDecimal.ZERO;

    if (reservation.getCanCancelUntil() != null && now.isAfter(reservation.getCanCancelUntil())) {
      // Quá hạn hủy miễn phí → Phí 50%
      cancellationFee = reservation.getTotalAmount().multiply(BigDecimal.valueOf(0.5));
    }

    reservation.setStatus(ReservationStatus.CANCELLED);
    reservation.setCancelledAt(LocalDateTime.now());
    reservation.setCancellationFee(cancellationFee);

    reservationRepository.save(reservation);

    // Unlock phòng trong room-service
    try {
      unlockRoomsForReservation(reservationId);
    } catch (Exception e) {
      System.err.println("Failed to unlock rooms: " + e.getMessage());
      // Không throw exception vì reservation đã cancel thành công
    }
  }

  @Transactional
  public ReservationResponse checkInReservation(String reservationId) {
    Reservation reservation = reservationRepository
      .findById(reservationId)
      .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

    // Chỉ cho phép check-in nếu đang CONFIRMED
    if (!ReservationStatus.CONFIRMED.equals(reservation.getStatus())) {
      throw new IllegalStateException("Cannot check-in: status is " + reservation.getStatus());
    }

    reservation.setStatus(ReservationStatus.CHECKED_IN);
    reservation.setActualCheckInTime(LocalDateTime.now());

    Reservation saved = reservationRepository.save(reservation);
    RoomTypeResponse roomType = getRoomTypeInfo(saved.getRoomTypeId());
    return toResponse(saved, roomType);
  }

  @Transactional
  public ReservationResponse checkOutReservation(String reservationId) {
    Reservation reservation = reservationRepository
      .findById(reservationId)
      .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

    // Chỉ cho phép check-out nếu đang CHECKED_IN
    if (!ReservationStatus.CHECKED_IN.equals(reservation.getStatus())) {
      throw new IllegalStateException("Cannot check-out: status is " + reservation.getStatus());
    }

    reservation.setStatus(ReservationStatus.CHECKED_OUT);
    reservation.setActualCheckOutTime(LocalDateTime.now());

    Reservation saved = reservationRepository.save(reservation);
    RoomTypeResponse roomType = getRoomTypeInfo(saved.getRoomTypeId());
    return toResponse(saved, roomType);
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
    // Calculate remaining amount
    BigDecimal remaining = r.getTotalAmount().subtract(r.getPaidAmount() != null ? r.getPaidAmount() : BigDecimal.ZERO);

    ReservationResponse response = new ReservationResponse();
    response.setReservationId(r.getReservationId());
    response.setReservationCode(r.getReservationCode());
    response.setUserId(r.getUserId());
    response.setRoomTypeId(r.getRoomTypeId());
    response.setRoomTypeName(roomType != null ? roomType.getName() : r.getRoomTypeName());
    response.setRoomImage(roomType != null && roomType.getImages() != null && !roomType.getImages().isEmpty()
      ? roomType.getImages().get(0)
      : null);
    response.setCheckInDate(r.getCheckInDate());
    response.setCheckOutDate(r.getCheckOutDate());
    response.setNumAdults(r.getNumAdults());
    response.setNumChildren(r.getNumChildren());

    // Pricing
    response.setBaseAmount(r.getBaseAmount());
    response.setAdditionalCharges(r.getAdditionalCharges());
    response.setDiscountAmount(r.getDiscountAmount());
    response.setTotalAmount(r.getTotalAmount());
    response.setPricePerNight(r.getPricePerNight());

    // Payment
    response.setPaymentStatus(r.getPaymentStatus());
    response.setPaidAmount(r.getPaidAmount() != null ? r.getPaidAmount() : BigDecimal.ZERO);
    response.setRemainingAmount(remaining);

    // Cancellation
    response.setCancellationPolicy(r.getCancellationPolicy());
    response.setCanCancelUntil(r.getCanCancelUntil());
    response.setCancelledAt(r.getCancelledAt());
    response.setCancellationReason(r.getCancellationReason());
    response.setCancellationFee(r.getCancellationFee());

    // Notes
    response.setSpecialRequests(r.getSpecialRequests());
    response.setStaffNotes(r.getStaffNotes());

    // Status - ĐÂY LÀ QUAN TRỌNG!
    response.setStatus(r.getStatus());

    response.setCreatedAt(r.getCreatedAt());

    return response;
  }

  /**
   * Gọi room-service để lock rooms
   */
  private void lockRoomsForReservation(String reservationId, String roomTypeId,
                                       LocalDate checkInDate, LocalDate checkOutDate) {
    try {
      String url = "http://room-service/internal/rooms/lock";

      String requestBody = String.format(
        "{\"reservationId\":\"%s\",\"roomTypeId\":\"%s\",\"checkInDate\":\"%s\",\"checkOutDate\":\"%s\"}",
        reservationId, roomTypeId, checkInDate, checkOutDate
      );

      org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
      headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

      org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);

      restTemplate.postForObject(url, entity, String.class);
    } catch (Exception e) {
      throw new RuntimeException("Failed to lock rooms: " + e.getMessage());
    }
  }

  /**
   * Gọi room-service để unlock rooms
   */
  private void unlockRoomsForReservation(String reservationId) {
    try {
      String url = "http://room-service/internal/rooms/unlock";

      String requestBody = String.format("{\"reservationId\":\"%s\"}", reservationId);

      org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
      headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

      org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);

      restTemplate.postForObject(url, entity, String.class);
    } catch (Exception e) {
      throw new RuntimeException("Failed to unlock rooms: " + e.getMessage());
    }
  }


  public DashboardResponse getDashboardData() {
    LocalDate today = LocalDate.now();

    TodayAction[] todayActions = reservationRepository.findByCheckInDateOrCheckOutDate(today, today)
      .stream()
      .map(r -> mapToTodayAction(r, today))
      .filter(a -> a != null) // lọc trường hợp không thỏa điều kiện
      .toArray(TodayAction[]::new);

    RoomSnapshot roomSnapshot;
    try {
      roomSnapshot = restTemplate.getForObject(
        "http://room-service/internal/rooms/snapshot", RoomSnapshot.class
      );
    } catch (Exception e) {
      roomSnapshot = new RoomSnapshot(); // mặc định 0
    }

    AlertItem[] alerts;
    try {
      alerts = restTemplate.getForObject(
        "http://room-service/internal/rooms/alerts", AlertItem[].class
      );
    } catch (Exception e) {
      alerts = new AlertItem[0];
    }

    DashboardSummary summary = new DashboardSummary();
    summary.setCheckInToday((int) Arrays.stream(todayActions).filter(a -> "CHECKIN".equals(a.getType())).count());
    summary.setCheckOutToday((int) Arrays.stream(todayActions).filter(a -> "CHECKOUT".equals(a.getType())).count());
    summary.setOverdue((int) Arrays.stream(todayActions).filter(a -> "OVERDUE".equals(a.getType())).count());

    DashboardResponse response = new DashboardResponse();
    response.setTodayActions(todayActions);
    response.setRoomSnapshot(roomSnapshot);
    response.setAlerts(alerts);
    response.setSummary(summary);

    return response;
  }

  /**
   * Map Reservation -> TodayAction
   */
  private TodayAction mapToTodayAction(Reservation r, LocalDate today) {
    TodayAction action = new TodayAction();
    action.setReservationId(r.getReservationId());
    action.setGuestName(r.getGuestFullName());
    action.setRoomNumber(r.getRoomTypeName());

    if (r.getCheckInDate().isEqual(today) && r.getStatus() == ReservationStatus.CONFIRMED) {
      action.setType("CHECKIN");
      action.setTypeLabel("Check-in hôm nay");
      action.setTime(r.getCheckInDate().toString());
    } else if (r.getCheckOutDate().isEqual(today) && r.getStatus() == ReservationStatus.CHECKED_IN) {
      action.setType("CHECKOUT");
      action.setTypeLabel("Check-out hôm nay");
      action.setTime(r.getCheckOutDate().toString());
    } else if (r.getStatus() == ReservationStatus.CONFIRMED && r.getCheckInDate().isBefore(today)) {
      action.setType("OVERDUE");
      action.setTypeLabel("Quá hạn check-in");
      action.setTime(r.getCheckInDate().toString());
    } else {
      return null;
    }

    return action;
  }

}
