package com.hotel.reservation.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.reservation.dto.CreateReservationRequest;
import com.hotel.reservation.dto.ReservationResponse;
import com.hotel.reservation.dto.RoomTypeResponse;
import com.hotel.reservation.entity.Reservation;
import com.hotel.reservation.entity.ReservationStatus;
import com.hotel.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ReservationResponse createReservation(CreateReservationRequest request, String userId) {
        // Validate dates
        validateDates(request.getCheckInDate(), request.getCheckOutDate());

        // Get room type info from room-service
        RoomTypeResponse roomType = getRoomTypeInfo(request.getRoomTypeId());
        if (roomType == null) {
            throw new RuntimeException("Loại phòng không tồn tại");
        }

        // Calculate total price
        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalAmount = roomType.getBasePrice().multiply(BigDecimal.valueOf(nights));

        // Create reservation
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

        Reservation saved = reservationRepository.save(reservation);

        return toResponse(saved, roomType);
    }
    
    private String generateReservationCode() {
        return "RES" + System.currentTimeMillis();
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
            
            // Parse the ApiResponse wrapper
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

    private ReservationResponse toResponse(Reservation reservation, RoomTypeResponse roomType) {
        ReservationResponse response = new ReservationResponse();
        response.setReservationId(reservation.getReservationId());
        response.setReservationCode(reservation.getReservationCode());
        response.setUserId(reservation.getUserId());
        response.setRoomTypeId(reservation.getRoomTypeId());
        response.setRoomTypeName(roomType != null ? roomType.getName() : "Unknown");
        response.setRoomImage(roomType != null && roomType.getImages() != null && !roomType.getImages().isEmpty() 
            ? roomType.getImages().get(0) : null);
        response.setCheckInDate(reservation.getCheckInDate());
        response.setCheckOutDate(reservation.getCheckOutDate());
        response.setNumAdults(reservation.getNumAdults());
        response.setNumChildren(reservation.getNumChildren());
        response.setTotalAmount(reservation.getTotalAmount());
        response.setPricePerNight(reservation.getPricePerNight());
        response.setSpecialRequests(reservation.getSpecialRequests());
        response.setStatus(reservation.getStatus());
        response.setCreatedAt(reservation.getCreatedAt());
        return response;
    }
}
