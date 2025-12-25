package com.hotel.reservation.controller;

import com.hotel.reservation.dto.ApiResponse;
import com.hotel.reservation.dto.CreateReservationRequest;
import com.hotel.reservation.dto.ReservationResponse;
import com.hotel.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            @RequestBody CreateReservationRequest request,
            @RequestHeader("X-User-Id") String userId) {
        try {
            ReservationResponse reservation = reservationService.createReservation(request, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đặt phòng thành công", reservation));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<ApiResponse<List<ReservationResponse>>> getMyReservations(
            @RequestHeader("X-User-Id") String userId) {
        try {
            List<ReservationResponse> reservations = reservationService.getUserReservations(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách đặt phòng thành công", reservations));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(
            @PathVariable String reservationId,
            @RequestHeader("X-User-Id") String userId) {
        try {
            reservationService.cancelReservation(reservationId, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Hủy đặt phòng thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
