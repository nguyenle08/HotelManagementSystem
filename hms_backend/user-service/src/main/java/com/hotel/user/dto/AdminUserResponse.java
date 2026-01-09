    package com.hotel.user.dto;

    import lombok.Data;

    @Data
    public class AdminUserResponse {
        private String userId;
        private String username;
        private String fullName;
        private String email;
        private String phone;
        private String password; // optional when creating
        private String role;
        private String status; // e.g., ACTIVE, LOCKED
        private String lastLogin;
    }
