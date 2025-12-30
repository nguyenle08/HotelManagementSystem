package com.hotel.auth.controller;

import com.hotel.auth.dto.ApiResponse;
import com.hotel.auth.dto.UserProfileResponse;
import com.hotel.auth.entity.User;
import com.hotel.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserRepository userRepository;

    /**
     * Internal API cho service-to-service communication
     * Không cần authentication vì chỉ được gọi từ bên trong hệ thống
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileResponse response = new UserProfileResponse(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullname(),
                user.getPhone(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }
}
