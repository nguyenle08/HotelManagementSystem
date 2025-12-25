package com.hotel.room.repository;

import com.hotel.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, String> {
    List<Room> findByRoomTypeIdAndStatus(String roomTypeId, String status);
    long countByRoomTypeIdAndStatus(String roomTypeId, String status);
}