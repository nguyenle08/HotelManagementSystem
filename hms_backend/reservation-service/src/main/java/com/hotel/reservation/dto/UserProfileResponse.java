package com.hotel.reservation.dto;

import lombok.Data;

@Data
public class UserProfileResponse {
  private String userId;
  private String fullName;
  private String email;
  private String phone;
  private String role;
}
