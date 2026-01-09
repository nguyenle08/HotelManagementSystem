package com.hotel.user.client;

import lombok.Data;

@Data
public class CreateAdminUserRequest {
    private String username;
    private String email;
    private String phone;
    private String password;
    private String fullname;
    private String role;
    private String adminSecretKey;
}
