package com.hotel.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String firstName;
    private String lastName;

    @NotBlank
    @Pattern(regexp = "^[0-9]{9,11}$")
    private String phone;

    private String address;
    private String cccd;
}

