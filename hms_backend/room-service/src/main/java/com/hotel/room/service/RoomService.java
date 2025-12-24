package com.hotel.room.service;

import com.hotel.room.dto.RoomSearchRequest;
import com.hotel.room.dto.RoomTypeResponse;
import com.hotel.room.entity.Room;
import com.hotel.room.entity.RoomType;
import com.hotel.room.repository.RoomAvailabilityRepository;
import com.hotel.room.repository.RoomRepository;
import com.hotel.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final RoomAvailabilityRepository availabilityRepository;

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
            response.setAmenities(rt.getAmenities());
            response.setImages(rt.getImages());
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
        response.setAmenities(rt.getAmenities());
        response.setImages(rt.getImages());
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
                    response.setAmenities(rt.getAmenities());
                    response.setImages(rt.getImages());
                    response.setIsActive(rt.getIsActive());
                    response.setAvailableRooms((int) availableCount);

                    return response;
                })
                .filter(rt -> rt.getAvailableRooms() > 0)
                .collect(Collectors.toList());
    }
}