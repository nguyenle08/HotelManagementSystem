package com.hotel.auth.dto;

import lombok.Data;

@Data
public class CreateAdminRequest {
    private String username;
    private String email;
    private String phone;
    private String password;
    private String fullname;
    private String adminSecretKey; // Secret key để bảo vệ endpoint
}
