package com.hotel.reservation.controller;

import com.hotel.reservation.dto.ApiResponse;
import com.hotel.reservation.dto.CreateReservationRequest;
import com.hotel.reservation.dto.ReservationDetailResponse;
import com.hotel.reservation.dto.ReservationResponse;
import com.hotel.reservation.service.ReservationDetailService;
import com.hotel.reservation.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservations", description = "Reservation booking, check-in, check-out operations")
public class ReservationController {

  private final ReservationService reservationService;
  private final ReservationDetailService reservationDetailService;

  @PostMapping
  public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
    @RequestBody CreateReservationRequest request,
    Authentication authentication,
    @RequestHeader("Authorization") String authHeader
  ) {
    try {
      String userId = authentication.getName();

      ReservationResponse reservation =
        reservationService.createReservation(request, userId, authHeader);

      return ResponseEntity.ok(
        new ApiResponse<>(true, "Đặt phòng thành công", reservation)
      );
    } catch (Exception e) {
      return ResponseEntity.badRequest()
        .body(new ApiResponse<>(false, e.getMessage(), null));
    }
  }

  @GetMapping("/my-reservations")
  public ResponseEntity<ApiResponse<List<ReservationResponse>>> getMyReservations(
    Authentication authentication) {
    try {
      String userId = authentication.getName();
      List<ReservationResponse> reservations = reservationService.getUserReservations(userId);
      return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đặt phòng thành công", reservations));
    } catch (Exception e) {
      return ResponseEntity.badRequest()
        .body(new ApiResponse<>(false, e.getMessage(), null));
    }
  }

  @GetMapping("/all")
  public ResponseEntity<ApiResponse<List<ReservationResponse>>> getAllReservations(
    Authentication authentication) {
    try {
      // Có thể thêm check role STAFF/ADMIN ở đây nếu cần
      List<ReservationResponse> reservations = reservationService.getAllReservations();
      return ResponseEntity.ok(new ApiResponse<>(true, "Lấy tất cả đặt phòng thành công", reservations));
    } catch (Exception e) {
      return ResponseEntity.badRequest()
        .body(new ApiResponse<>(false, e.getMessage(), null));
    }
  }

  @GetMapping("/{reservationId}")
  public ResponseEntity<ApiResponse<ReservationDetailResponse>> getReservationDetail(
    @PathVariable String reservationId,
    Authentication authentication,
    @RequestHeader(value = "Authorization", required = false) String authHeader) {

    try {
      String userId = authentication.getName();

      ReservationDetailResponse detail =
        reservationDetailService.getDetail(reservationId, userId, authHeader);

      return ResponseEntity.ok(
        new ApiResponse<>(true, "Lấy chi tiết đặt phòng thành công", detail)
      );
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(new ApiResponse<>(false, e.getMessage(), null));
    }
  }

  @DeleteMapping("/{reservationId}/cancel")
  public ResponseEntity<ApiResponse<Void>> cancelReservation(
    @PathVariable String reservationId,
    Authentication authentication
  ) {
    try {
      String userId = authentication.getName();

      // Gọi service hủy booking
      reservationService.cancelReservation(reservationId, userId);

      return ResponseEntity.ok(
        new ApiResponse<>(true, "Hủy đặt phòng thành công", null)
      );
    } catch (IllegalStateException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ApiResponse<>(false, e.getMessage(), null));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ApiResponse<>(false, e.getMessage(), null));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ApiResponse<>(false, e.getMessage(), null));
    }
  }

  @PutMapping("/{reservationId}/check-in")
  public ResponseEntity<ApiResponse<ReservationResponse>> checkInReservation(
    @PathVariable String reservationId,
    Authentication authentication
  ) {
    try {
      ReservationResponse reservation = reservationService.checkInReservation(reservationId);
      return ResponseEntity.ok(
        new ApiResponse<>(true, "Check-in thành công", reservation)
      );
    } catch (IllegalStateException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ApiResponse<>(false, e.getMessage(), null));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ApiResponse<>(false, e.getMessage(), null));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ApiResponse<>(false, e.getMessage(), null));
    }
  }

  @PutMapping("/{reservationId}/check-out")
  public ResponseEntity<ApiResponse<ReservationResponse>> checkOutReservation(
    @PathVariable String reservationId,
    Authentication authentication
  ) {
    try {
      ReservationResponse reservation = reservationService.checkOutReservation(reservationId);
      return ResponseEntity.ok(
        new ApiResponse<>(true, "Check-out thành công", reservation)
      );
    } catch (IllegalStateException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ApiResponse<>(false, e.getMessage(), null));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ApiResponse<>(false, e.getMessage(), null));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ApiResponse<>(false, e.getMessage(), null));
    }
  }

}
