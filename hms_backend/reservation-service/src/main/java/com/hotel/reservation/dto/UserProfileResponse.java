package com.hotel.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
  private String userId;
  private String username;
  private String fullName;
  private String email;
  private String phone;
  private String role;
}
