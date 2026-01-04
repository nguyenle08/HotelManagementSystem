package com.hotel.auth.controller;

import com.hotel.auth.dto.ApiResponse;
import com.hotel.auth.dto.AuthResponse;
import com.hotel.auth.dto.CreateAdminRequest;
import com.hotel.auth.dto.CreateUserByAdminRequest;
import com.hotel.auth.dto.LoginRequest;
import com.hotel.auth.dto.RegisterRequest;
import com.hotel.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication and user registration endpoints")
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
     * Endpoint để tạo admin đầu tiên
     * Chỉ cho phép tạo nếu chưa có admin nào trong hệ thống
     * Không cần secret key, tự động reject nếu đã có admin
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
     * TODO: Thêm @PreAuthorize("hasRole('ADMIN')") hoặc check JWT token manually
     * Hiện tại SecurityConfig permitAll /api/auth/** nên cần thêm logic check role
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
