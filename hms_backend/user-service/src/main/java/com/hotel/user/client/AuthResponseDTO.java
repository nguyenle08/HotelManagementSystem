package com.hotel.user.client;

import lombok.Data;

@Data
public class AuthResponseDTO {
    private String token;
    private String refreshToken;
    private String userId;
    private String username;
    private String email;
    private String fullname;
    private String role;
}
