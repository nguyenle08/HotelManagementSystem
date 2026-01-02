package com.hotel.room.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.room.dto.RoomTypeRequest;
import com.hotel.room.dto.RoomTypeResponse;
import com.hotel.room.entity.RoomType;
import com.hotel.room.repository.RoomRepository;
import com.hotel.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomTypeService {

  private final RoomTypeRepository roomTypeRepository;
  private final RoomRepository roomRepository;
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

  private String toJson(List<String> list) {
    if (list == null || list.isEmpty()) {
      return "[]";
    }
    try {
      return objectMapper.writeValueAsString(list);
    } catch (Exception e) {
      return "[]";
    }
  }

  public List<RoomTypeResponse> getAllRoomTypes() {
    List<RoomType> roomTypes = roomTypeRepository.findByIsActiveTrue();

    return roomTypes.stream().map(this::mapToResponse).collect(Collectors.toList());
  }

  public RoomTypeResponse getRoomTypeById(String id) {
    RoomType roomType = roomTypeRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("Không tìm thấy loại phòng"));

    return mapToResponse(roomType);
  }

  @Transactional
  public RoomTypeResponse createRoomType(RoomTypeRequest request) {
    RoomType roomType = new RoomType();
    roomType.setRoomTypeId(UUID.randomUUID().toString());
    roomType.setName(request.getName());
    roomType.setDescription(request.getDescription());
    roomType.setBasePrice(request.getBasePrice());
    roomType.setMaxGuests(request.getMaxGuests());
    roomType.setBedType(request.getBedType());
    roomType.setSizeSqm(request.getSizeSqm() != null ? BigDecimal.valueOf(request.getSizeSqm()) : null);
    roomType.setAmenities(toJson(request.getAmenities()));
    roomType.setImages(toJson(request.getImages()));
    roomType.setIsActive(true);

    RoomType saved = roomTypeRepository.save(roomType);
    return mapToResponse(saved);
  }

  @Transactional
  public RoomTypeResponse updateRoomType(String id, RoomTypeRequest request) {
    RoomType roomType = roomTypeRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("Không tìm thấy loại phòng"));

    roomType.setName(request.getName());
    roomType.setDescription(request.getDescription());
    roomType.setBasePrice(request.getBasePrice());
    roomType.setMaxGuests(request.getMaxGuests());
    roomType.setBedType(request.getBedType());
    roomType.setSizeSqm(request.getSizeSqm() != null ? BigDecimal.valueOf(request.getSizeSqm()) : null);
    roomType.setAmenities(toJson(request.getAmenities()));
    roomType.setImages(toJson(request.getImages()));

    RoomType updated = roomTypeRepository.save(roomType);
    return mapToResponse(updated);
  }

  @Transactional
  public void deleteRoomType(String id) {
    RoomType roomType = roomTypeRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("Không tìm thấy loại phòng"));

    // Soft delete
    roomType.setIsActive(false);
    roomTypeRepository.save(roomType);
  }

  private RoomTypeResponse mapToResponse(RoomType rt) {
    RoomTypeResponse response = new RoomTypeResponse();
    response.setRoomTypeId(rt.getRoomTypeId());
    response.setName(rt.getName());
    response.setDescription(rt.getDescription());
    response.setBasePrice(rt.getBasePrice());
    response.setMaxGuests(rt.getMaxGuests());
    response.setBedType(rt.getBedType());
    response.setSizeSqm(rt.getSizeSqm() != null ? rt.getSizeSqm().doubleValue() : null);
    response.setAmenities(parseJsonList(rt.getAmenities()));
    response.setImages(parseJsonList(rt.getImages()));
    response.setIsActive(rt.getIsActive());

    // Count total rooms and available rooms
    long totalRooms = roomRepository.countByRoomTypeId(rt.getRoomTypeId());
    long availableRooms = roomRepository.countByRoomTypeIdAndStatus(rt.getRoomTypeId(), "ACTIVE");
    
    response.setTotalRooms((int) totalRooms);
    response.setAvailableRooms((int) availableRooms);

    return response;
  }
}
