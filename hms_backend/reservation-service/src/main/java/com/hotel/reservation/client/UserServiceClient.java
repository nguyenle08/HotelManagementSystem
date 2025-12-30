package com.hotel.reservation.client;

import com.hotel.reservation.dto.UserProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service")
public interface UserServiceClient {

  /**
   * Gọi internal endpoint không cần authentication
   * Dùng cho service-to-service communication
   */
  @GetMapping("/api/internal/users/{userId}")
  UserProfileResponse getUserProfile(@PathVariable("userId") String userId);
}
