package com.hotel.user.repository;

import com.hotel.user.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuestRepository extends JpaRepository<Guest, String> {
    Optional<Guest> findByUserId(String userId);

    boolean existsByUserId(String userId);
}