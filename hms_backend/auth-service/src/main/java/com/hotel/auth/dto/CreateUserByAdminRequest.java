package com.hotel.auth.dto;

import lombok.Data;

@Data
public class CreateUserByAdminRequest {
    private String username;
    private String email;
    private String phone;
    private String password;
    private String fullname;
    private String role; // ADMIN, MANAGER, STAFF, USER
    private String adminSecretKey; // Bảo mật endpoint
}
