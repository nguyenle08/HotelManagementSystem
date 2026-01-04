package com.hotel.user.controller;

import com.hotel.user.dto.CreateGuestRequest;
import com.hotel.user.entity.Guest;
import com.hotel.user.repository.GuestRepository;
import com.hotel.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/internal/guests")
@RequiredArgsConstructor
public class InternalGuestController {

    private final GuestRepository guestRepository;
    private final UserService userService;

    @PostMapping
    public void createGuest(@RequestBody CreateGuestRequest req) {
        /*Guest guest = new Guest();
        guest.setGuestId(UUID.randomUUID().toString());
        guest.setUserId(req.getUserId());
        guestRepository.save(guest);*/
        userService.createGuest(req);
    }
}
