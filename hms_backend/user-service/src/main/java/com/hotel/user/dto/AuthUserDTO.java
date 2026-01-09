package com.hotel.user.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class AuthUserDTO {
    private String userId;
    private String username;
    private String role;
    @JsonAlias({"fullName", "fullname"})
    private String fullname; // Accept both 'fullName' and 'fullname' JSON keys
    private String phone;
    private String email;
    private Boolean isActive;
    private String lastLogin;

    // Getter bổ trợ để không làm hỏng logic cũ
    public String getFirstName() {
        return (fullname != null && fullname.contains(" ")) ? fullname.substring(0, fullname.indexOf(' ')) : fullname;
    }
}

