package com.hotel.auth.controller;

import com.hotel.auth.dto.ApiResponse;
import com.hotel.auth.dto.AuthResponse;
import com.hotel.auth.dto.CreateAdminRequest;
import com.hotel.auth.dto.CreateUserByAdminRequest;
import com.hotel.auth.dto.LoginRequest;
import com.hotel.auth.dto.RegisterRequest;
import com.hotel.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(new ApiResponse(true, "Đăng ký thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(new ApiResponse(true, "Đăng nhập thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    /**
     * Endpoint đặc biệt để tạo admin đầu tiên
     * Sau khi có admin, nên disable endpoint này
     */
    @PostMapping("/create-admin")
    public ResponseEntity<ApiResponse> createAdmin(@RequestBody CreateAdminRequest request) {
        try {
            AuthResponse response = authService.createAdmin(request);
            return ResponseEntity.ok(new ApiResponse(true, "Tạo tài khoản Admin thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    /**
     * Endpoint để admin tạo user với role bất kỳ
     * Admin có thể tạo: ADMIN, MANAGER, STAFF, USER
     */
    @PostMapping("/admin/create-user")
    public ResponseEntity<ApiResponse> createUserByAdmin(@RequestBody CreateUserByAdminRequest request) {
        try {
            AuthResponse response = authService.createUserByAdmin(request);
            return ResponseEntity.ok(new ApiResponse(true, "Tạo tài khoản thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }
}
