package com.hotel.auth.service;

import com.hotel.auth.dto.AuthResponse;
import com.hotel.auth.dto.CreateAdminRequest;
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

    @Value("${admin.secret.key:SUPER_SECRET_ADMIN_KEY_2025}")
    private String adminSecretKey;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        // Create user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullname(request.getFullname());
        user.setRole("USER");

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

    @Transactional
    public AuthResponse createAdmin(CreateAdminRequest request) {
        // Validate secret key
        if (!adminSecretKey.equals(request.getAdminSecretKey())) {
            throw new RuntimeException("Invalid admin secret key");
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
     * Chỉ admin mới được gọi (cần secret key)
     */
    @Transactional
    public AuthResponse createUserByAdmin(CreateUserByAdminRequest request) {
        // Validate secret key
        if (!adminSecretKey.equals(request.getAdminSecretKey())) {
            throw new RuntimeException("Invalid admin secret key");
        }

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