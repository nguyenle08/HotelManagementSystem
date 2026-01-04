package com.hotel.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateGuestRequest {
    private String userId;
    private String firstName;
    private String lastName;
    private String phone;
    private String cccd;

}
