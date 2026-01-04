package com.hotel.user.dto;

import lombok.Data;

@Data
public class CreateGuestRequest {
    private String userId;
    private String firstName;
    private String lastName;
    private String phone;
    private String cccd;
}
