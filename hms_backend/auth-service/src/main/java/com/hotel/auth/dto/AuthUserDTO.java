package com.hotel.auth.dto;

import lombok.Data;

@Data
public class AuthUserDTO {

    private String userId;
    private String username;
    private String role;
    private String fullname;
    private String phone;
}

