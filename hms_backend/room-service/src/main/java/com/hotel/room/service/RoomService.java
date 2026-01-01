package com.hotel.room.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.room.dto.RoomSearchRequest;
import com.hotel.room.dto.RoomStatusResponse;
import com.hotel.room.dto.RoomTypeResponse;
import com.hotel.room.entity.Room;
import com.hotel.room.entity.RoomAvailability;
import com.hotel.room.entity.RoomType;
import com.hotel.room.repository.RoomAvailabilityRepository;
import com.hotel.room.repository.RoomRepository;
import com.hotel.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

  private final RoomTypeRepository roomTypeRepository;
  private final RoomRepository roomRepository;
  private final RoomAvailabilityRepository availabilityRepository;
  private final ObjectMapper objectMapper = new ObjectMapper();

  private List<String> parseJsonList(String json) {
    if (json == null || json.isEmpty()) {
      return new ArrayList<>();
    }
    try {
      return objectMapper.readValue(json, new TypeReference<List<String>>() {});
    } catch (Exception e) {
      return new ArrayList<>();
    }
  }

  public List<RoomStatusResponse> getAllRoomsWithStatus() {
    List<Room> rooms = roomRepository.findAll();
    List<RoomType> roomTypes = roomTypeRepository.findAll();

    return rooms.stream().map(r -> {
      RoomStatusResponse resp = new RoomStatusResponse();
      resp.setRoomId(r.getRoomId());
      resp.setRoomNumber(r.getRoomNumber());
      resp.setFloor(r.getFloor());
      resp.setStatus(r.getStatus());
      resp.setRoomTypeId(r.getRoomTypeId());

      roomTypes.stream()
        .filter(rt -> rt.getRoomTypeId().equals(r.getRoomTypeId()))
        .findFirst()
        .ifPresent(rt -> resp.setRoomTypeName(rt.getName()));

      return resp;
    }).collect(Collectors.toList());
  }

  public List<RoomTypeResponse> getAllRoomTypes() {
    List<RoomType> roomTypes = roomTypeRepository.findByIsActiveTrue();

    return roomTypes.stream().map(rt -> {
      RoomTypeResponse response = new RoomTypeResponse();
      response.setRoomTypeId(rt.getRoomTypeId());
      response.setName(rt.getName());
      response.setDescription(rt.getDescription());
      response.setBasePrice(rt.getBasePrice());
      response.setMaxGuests(rt.getMaxGuests());
      response.setBedType(rt.getBedType());
      response.setSizeSqm(rt.getSizeSqm());
      response.setAmenities(parseJsonList(rt.getAmenities()));
      response.setImages(parseJsonList(rt.getImages()));
      response.setIsActive(rt.getIsActive());

      // Count available rooms
      long totalRooms = roomRepository.countByRoomTypeIdAndStatus(rt.getRoomTypeId(), "ACTIVE");
      response.setAvailableRooms((int) totalRooms);

      return response;
    }).collect(Collectors.toList());
  }

  public RoomTypeResponse getRoomTypeById(String id) {
    RoomType rt = roomTypeRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("Không tìm thấy loại phòng"));

    RoomTypeResponse response = new RoomTypeResponse();
    response.setRoomTypeId(rt.getRoomTypeId());
    response.setName(rt.getName());
    response.setDescription(rt.getDescription());
    response.setBasePrice(rt.getBasePrice());
    response.setMaxGuests(rt.getMaxGuests());
    response.setBedType(rt.getBedType());
    response.setSizeSqm(rt.getSizeSqm());
    response.setAmenities(parseJsonList(rt.getAmenities()));
    response.setImages(parseJsonList(rt.getImages()));
    response.setIsActive(rt.getIsActive());

    long totalRooms = roomRepository.countByRoomTypeIdAndStatus(rt.getRoomTypeId(), "ACTIVE");
    response.setAvailableRooms((int) totalRooms);

    return response;
  }

  public List<RoomTypeResponse> searchAvailableRooms(RoomSearchRequest request) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    LocalDate checkIn = LocalDate.parse(request.getCheckInDate(), formatter);
    LocalDate checkOut = LocalDate.parse(request.getCheckOutDate(), formatter);

    // Get unavailable room IDs
    List<String> unavailableRoomIds = availabilityRepository
      .findUnavailableRoomIds(checkIn, checkOut);

    List<RoomType> roomTypes = roomTypeRepository.findByIsActiveTrue();

    return roomTypes.stream().map(rt -> {
        // Get all active rooms for this type
        List<Room> allRooms = roomRepository
          .findByRoomTypeIdAndStatus(rt.getRoomTypeId(), "ACTIVE");

        // Count available rooms
        long availableCount = allRooms.stream()
          .filter(room -> !unavailableRoomIds.contains(room.getRoomId()))
          .count();

        RoomTypeResponse response = new RoomTypeResponse();
        response.setRoomTypeId(rt.getRoomTypeId());
        response.setName(rt.getName());
        response.setDescription(rt.getDescription());
        response.setBasePrice(rt.getBasePrice());
        response.setMaxGuests(rt.getMaxGuests());
        response.setBedType(rt.getBedType());
        response.setSizeSqm(rt.getSizeSqm());
        response.setAmenities(parseJsonList(rt.getAmenities()));
        response.setImages(parseJsonList(rt.getImages()));
        response.setIsActive(rt.getIsActive());
        response.setAvailableRooms((int) availableCount);

        return response;
      })
      .filter(rt -> rt.getAvailableRooms() > 0)
      .collect(Collectors.toList());
  }

  /**
   * Lock rooms cho reservation - tạo RoomAvailability records với status RESERVED
   */
  public void lockRoomsForReservation(String reservationId, String roomTypeId,
                                      LocalDate checkInDate, LocalDate checkOutDate) {
    // Tìm 1 phòng available cho room type này
    List<Room> rooms = roomRepository.findByRoomTypeIdAndStatus(roomTypeId, "ACTIVE");

    if (rooms.isEmpty()) {
      throw new RuntimeException("Không có phòng active cho loại phòng này");
    }

    // Lấy danh sách phòng đã bị unavailable trong khoảng thời gian
    List<String> unavailableRoomIds = availabilityRepository
      .findUnavailableRoomIds(checkInDate, checkOutDate);

    // Tìm phòng available
    Room availableRoom = rooms.stream()
      .filter(room -> !unavailableRoomIds.contains(room.getRoomId()))
      .findFirst()
      .orElseThrow(() -> new RuntimeException("Không còn phòng trống trong khoảng thời gian này"));

    // Tạo availability records cho mỗi ngày từ check-in đến check-out
    LocalDate currentDate = checkInDate;
    while (!currentDate.isAfter(checkOutDate.minusDays(1))) {
      RoomAvailability availability = new RoomAvailability();
      availability.setAvailabilityId(UUID.randomUUID().toString());
      availability.setRoomId(availableRoom.getRoomId());
      availability.setDate(currentDate);
      availability.setStatus("RESERVED");
      availability.setReservationId(reservationId);
      availability.setUpdatedAt(LocalDateTime.now());

      availabilityRepository.save(availability);
      currentDate = currentDate.plusDays(1);
    }
  }

  /**
   * Unlock rooms khi cancel reservation
   */
  public void unlockRoomsForReservation(String reservationId) {
    List<RoomAvailability> availabilities = availabilityRepository
      .findByReservationId(reservationId);

    availabilityRepository.deleteAll(availabilities);
  }

  /**
   * TESTING ONLY - Xóa availability records sau một ngày cụ thể
   */
  public void cleanupAvailabilityAfterDate(String afterDate) {
    LocalDate date = LocalDate.parse(afterDate);
    List<RoomAvailability> records = availabilityRepository
      .findByDateGreaterThanEqual(date);
    availabilityRepository.deleteAll(records);
  }
}
