package com.hotel.room.controller;

import com.hotel.room.dto.LockRoomRequest;
import com.hotel.room.dto.UnlockRoomRequest;
import com.hotel.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal API - chỉ dùng cho inter-service communication
 * Không cần authentication vì gọi qua internal network
 */
@RestController
@RequestMapping("/internal/rooms")
@RequiredArgsConstructor
public class RoomInternalController {

    private final RoomService roomService;

    /**
     * Lock rooms cho reservation
     */
    @PostMapping("/lock")
    public ResponseEntity<String> lockRooms(@RequestBody LockRoomRequest request) {
        try {
            roomService.lockRoomsForReservation(
                    request.getReservationId(),
                    request.getRoomTypeId(),
                    request.getCheckInDate(),
                    request.getCheckOutDate()
            );
            return ResponseEntity.ok("Rooms locked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to lock rooms: " + e.getMessage());
        }
    }

    /**
     * Unlock rooms khi cancel reservation
     */
    @PostMapping("/unlock")
    public ResponseEntity<String> unlockRooms(@RequestBody UnlockRoomRequest request) {
        try {
            roomService.unlockRoomsForReservation(request.getReservationId());
            return ResponseEntity.ok("Rooms unlocked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to unlock rooms: " + e.getMessage());
        }
    }

    /**
     * TESTING ONLY - Xóa tất cả availability records sau một ngày cụ thể
     */
    @DeleteMapping("/availability/cleanup")
    public ResponseEntity<String> cleanupAvailability(@RequestParam String afterDate) {
        try {
            roomService.cleanupAvailabilityAfterDate(afterDate);
            return ResponseEntity.ok("Availability records cleaned up after " + afterDate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to cleanup: " + e.getMessage());
        }
    }
}
