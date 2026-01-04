package com.hotel.user.dto;

import com.hotel.user.entity.Employee;
import com.hotel.user.entity.Guest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/*@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {

    private String userId;
    private String fullName;
    private String phone;
    private String role;

    private String cccd;
    private String address;

    /* Guest *
    private Integer loyaltyPoints;
    private String memberTier;

    /* Employee *
    private String employeeCode;
    private String department;
    private String position;

    public static ProfileResponse fromGuest(Guest g) {
        return new ProfileResponse(
                g.getUserId(),
                null, // fullname lấy từ auth nếu cần
                null, // phone lấy từ auth nếu cần
                "USER",
                g.getCccd(),
                g.getAddress(),
                g.getLoyaltyPoints(),
                g.getMemberTier(),
                null,
                null,
                null
        );
    }

    public static ProfileResponse fromEmployee(/Employee e) {
        return new ProfileResponse(
                e.getUserId(),
                null,
                null,
                "EMPLOYEE",
                e.getCccd(),
                e.getAddress(),
                null,
                null,
                e.getEmployeeCode(),
                e.getDepartment(),
                e.getPosition()
        );
    }
}*/
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {

    private String userId;

    private String username;
    private String role;
    private String firstName;
    private String lastName;
    private String phone;
    private String cccd;
    private String address;
}


