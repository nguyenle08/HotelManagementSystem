package com.hotel.user.controller;

import com.hotel.user.dto.ProfileResponse;
import com.hotel.user.dto.UpdateProfileRequest;
import com.hotel.user.entity.Guest;
import com.hotel.user.repository.GuestRepository;
import com.hotel.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final GuestRepository userRepository;
    private final UserService userService;

    @PostMapping
    public Guest createUser(@RequestBody Guest user) {
        return userRepository.save(user);
    }

    @GetMapping
    public List<Guest> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/me")
    public ProfileResponse me(@RequestHeader("X-User-Id") String userId) {
        System.out.println(">>> X-User-Id = " + userId);
        return userService.getMyProfile(userId);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> update(
            @PathVariable String userId,
            @RequestHeader("X-User-Id") String jwtUserId,
            @RequestBody UpdateProfileRequest req
    ) {
        System.out.println("X-User-Id (HEADER) = " + jwtUserId);
        System.out.println("userId (PATH) = " + userId);

        if (!userId.equals(jwtUserId)) {
            return ResponseEntity.status(403).build();
        }
        userService.updateProfile(userId, req);
        return ResponseEntity.ok().build();
    }
}
