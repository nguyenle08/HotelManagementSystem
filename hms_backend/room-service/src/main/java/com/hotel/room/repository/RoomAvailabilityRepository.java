package com.hotel.room.repository;

import com.hotel.room.entity.RoomAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomAvailabilityRepository extends JpaRepository<RoomAvailability, String> {

    @Query("SELECT DISTINCT ra.roomId FROM RoomAvailability ra " +
            "WHERE ra.date BETWEEN :checkIn AND :checkOut " +
            "AND ra.status IN ('RESERVED', 'OCCUPIED', 'BLOCKED')")
    List<String> findUnavailableRoomIds(@Param("checkIn") LocalDate checkIn,
                                        @Param("checkOut") LocalDate checkOut);
}