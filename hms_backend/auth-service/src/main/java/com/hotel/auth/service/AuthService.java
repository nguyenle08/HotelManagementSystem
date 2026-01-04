package com.hotel.auth.service;

import com.hotel.auth.client.UserClient;
import com.hotel.auth.dto.AuthResponse;
import com.hotel.auth.dto.CreateAdminRequest;
import com.hotel.auth.dto.CreateGuestRequest;
import com.hotel.auth.dto.CreateUserByAdminRequest;
import com.hotel.auth.dto.LoginRequest;
import com.hotel.auth.dto.RegisterRequest;
import com.hotel.auth.entity.User;
import com.hotel.auth.repository.UserRepository;
import com.hotel.auth.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserClient userClient;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        // Gán fullname để đồng bộ sang Auth DB
        user.setFullname(request.getFullname());
        user.setRole("USER");

        user = userRepository.save(user);

        // ✅ TÁCH HỌ TÊN
        String firstName = "";
        String lastName = "";

        if (request.getFullname() != null && !request.getFullname().trim().isEmpty()) {
            String fullname = request.getFullname().trim();
            int lastSpaceIndex = fullname.lastIndexOf(" ");

            if (lastSpaceIndex != -1) {
                lastName = fullname.substring(0, lastSpaceIndex);
                firstName = fullname.substring(lastSpaceIndex + 1);
            } else {
                firstName = fullname;
            }
        }

        // ✅ GỌI USER-SERVICE TẠO GUEST
        userClient.createGuest(
                new CreateGuestRequest(
                        user.getUserId(),
                        firstName,
                        lastName,
                        request.getPhone(),
                        request.getCccd() != null ? request.getCccd() : "Chưa cập nhật"
                )
        );

        return new AuthResponse(
                jwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getRole()),
                jwtUtil.generateRefreshToken(user.getUserId()),
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullname(),
                user.getRole()
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Tên đăng nhập hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        if (!user.getIsActive()) {
            throw new RuntimeException("Tài khoản đã bị khóa");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate tokens
        String token = jwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());

        return new AuthResponse(
                token,
                refreshToken,
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullname(),
                user.getRole()
        );
    }

    /**
     * Tạo admin đầu tiên
     * Chỉ cho phép tạo nếu chưa có admin nào trong hệ thống
     * Không cần secret key
     */
    @Transactional
    public AuthResponse createAdmin(CreateAdminRequest request) {
        // Check xem đã có admin chưa
        if (userRepository.existsByRole("ADMIN")) {
            throw new RuntimeException("Đã có admin trong hệ thống. Không thể tạo thêm admin qua endpoint này.");
        }

        // Validate
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // Create admin user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullname(request.getFullname());
        user.setRole("ADMIN");
        user.setIsActive(true);
        user.setIsVerified(true);

        user = userRepository.save(user);

        // Generate tokens
        String token = jwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());

        return new AuthResponse(
                token,
                refreshToken,
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullname(),
                user.getRole()
        );
    }

    /**
     * Tạo user với role tùy chọn (ADMIN, MANAGER, STAFF, USER)
     * Chỉ admin mới được gọi (check JWT token từ controller)
     */
    @Transactional
    public AuthResponse createUserByAdmin(CreateUserByAdminRequest request) {
        // Validate
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // Validate role
        String role = request.getRole() != null ? request.getRole().toUpperCase() : "USER";
        if (!role.matches("ADMIN|MANAGER|STAFF|USER")) {
            throw new RuntimeException("Role không hợp lệ. Chỉ chấp nhận: ADMIN, MANAGER, STAFF, USER");
        }

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullname(request.getFullname());
        user.setRole(role);
        user.setIsActive(true);
        user.setIsVerified(true); // Admin tạo nên auto verify

        user = userRepository.save(user);

        // TODO: Nếu role là USER, có thể gọi User Service để tạo Guest profile
        // Ví dụ: userServiceClient.createGuest(user.getUserId(), ...);

        // Generate tokens
        String token = jwtUtil.generateToken(user.getUserId(), user.getUsername(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());

        return new AuthResponse(
                token,
                refreshToken,
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullname(),
                user.getRole()
        );
    }
}