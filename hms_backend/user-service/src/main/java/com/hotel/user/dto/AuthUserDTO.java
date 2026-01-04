package com.hotel.user.dto;

import lombok.Data;

@Data
public class AuthUserDTO {
    private String userId;
    private String username;
    private String role;
    private String fullname; // Khớp với trường 'fullname' trong auth_service_db
    private String phone;

    // Getter bổ trợ để không làm hỏng logic cũ
    public String getFirstName() {
        return (fullname != null && fullname.contains(" ")) ? fullname.substring(fullname.lastIndexOf(" ") + 1) : fullname;
    }
}

