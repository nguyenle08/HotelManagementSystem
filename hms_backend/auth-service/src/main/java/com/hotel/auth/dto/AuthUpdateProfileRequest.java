package com.hotel.auth.dto;

import lombok.Data;

@Data
public class AuthUpdateProfileRequest {

    private String firstName;
    private String lastName;
    private String phone;
}

