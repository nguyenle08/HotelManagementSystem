package com.hotel.user.controller;

import com.hotel.user.entity.Guest;
import com.hotel.user.repository.GuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final GuestRepository userRepository;

    @PostMapping
    public Guest createUser(@RequestBody Guest user) {
        return userRepository.save(user);
    }

    @GetMapping
    public List<Guest> getAllUsers() {
        return userRepository.findAll();
    }
}
