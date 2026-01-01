package com.hotel.room.controller;

import com.hotel.room.dto.ApiResponse;
import com.hotel.room.dto.RoomSearchRequest;
import com.hotel.room.dto.RoomTypeResponse;
import com.hotel.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

  private final RoomService roomService;

  @GetMapping
  public ResponseEntity<ApiResponse> getAllRooms() {
    try {
      List<RoomTypeResponse> rooms = roomService.getAllRoomTypes();
      return ResponseEntity.ok(new ApiResponse(true, "Lấy danh sách phòng thành công", rooms));
    } catch (Exception e) {
      return ResponseEntity.badRequest()
        .body(new ApiResponse(false, e.getMessage(), null));
    }
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse> getRoomById(@PathVariable String id) {
    try {
      RoomTypeResponse room = roomService.getRoomTypeById(id);
      return ResponseEntity.ok(new ApiResponse(true, "Lấy thông tin phòng thành công", room));
    } catch (Exception e) {
      return ResponseEntity.badRequest()
        .body(new ApiResponse(false, e.getMessage(), null));
    }
  }

  @PostMapping("/search")
  public ResponseEntity<ApiResponse> searchRooms(@RequestBody RoomSearchRequest request) {
    try {
      List<RoomTypeResponse> rooms = roomService.searchAvailableRooms(request);
      return ResponseEntity.ok(new ApiResponse(true, "Tìm kiếm thành công", rooms));
    } catch (Exception e) {
      return ResponseEntity.badRequest()
        .body(new ApiResponse(false, e.getMessage(), null));
    }
  }

  @GetMapping("/status")
  public ResponseEntity<ApiResponse> getAllRoomStatuses() {
    try {
      var rooms = roomService.getAllRoomsWithStatus();
      return ResponseEntity.ok(new ApiResponse(true, "Lấy trạng thái phòng thành công", rooms));
    } catch (Exception e) {
      return ResponseEntity.badRequest()
        .body(new ApiResponse(false, e.getMessage(), null));
    }
  }
}
