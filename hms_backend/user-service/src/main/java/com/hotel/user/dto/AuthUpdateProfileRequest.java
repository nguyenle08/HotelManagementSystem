package com.hotel.user.dto;

import lombok.Data;

@Data
public class AuthUpdateProfileRequest {

    private String firstName;
    private String lastName;
    private String phone;
}

