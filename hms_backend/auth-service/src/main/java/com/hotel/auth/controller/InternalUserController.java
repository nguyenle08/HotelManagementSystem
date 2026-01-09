package com.hotel.auth.controller;

import com.hotel.auth.dto.ApiResponse;
import com.hotel.auth.dto.AuthUpdateProfileRequest;
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
                user.getRole(),
                user.getIsActive(),
                user.getLastLogin()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<java.util.List<UserProfileResponse>> getAllUsers() {
        java.util.List<User> users = userRepository.findAll();
        java.util.List<UserProfileResponse> responses = new java.util.ArrayList<>();
        for (User u : users) {
            responses.add(new UserProfileResponse(
                    u.getUserId(),
                    u.getUsername(),
                    u.getEmail(),
                    u.getFullname(),
                    u.getPhone(),
                    u.getRole(),
                    u.getIsActive(),
                    u.getLastLogin()
            ));
        }
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{userId}")
    public void updateProfile(
            @PathVariable String userId,
            @RequestBody AuthUpdateProfileRequest req
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullname(req.getFirstName() + " " + req.getLastName());
        user.setPhone(req.getPhone());
        userRepository.save(user);
    }

    @PostMapping("/users/{userId}/lock")
    public ResponseEntity<?> lockUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{userId}/unlock")
    public ResponseEntity<?> unlockUser(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(true);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

        @PutMapping("/users/{userId}/role")
        public ResponseEntity<?> updateRole(@PathVariable String userId, @RequestBody com.hotel.auth.dto.AuthUpdateRoleRequest req) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                if (req.getRole() != null) {
                        user.setRole(req.getRole().toUpperCase().replace("ROLE_", ""));
                        userRepository.save(user);
                }
                return ResponseEntity.ok().build();
        }
}
