-- Tạo tài khoản Admin mặc định
USE auth_service_db;

-- Password: Admin@123 (đã mã hóa bằng BCrypt)
INSERT INTO users (user_id, username, email, phone, password, role, fullname, is_active, is_verified, created_at, updated_at)
VALUES 
  (UUID(), 'admin', 'admin@hotel.com', '0123456789', 
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
   'ADMIN', 'Administrator', TRUE, TRUE, NOW(), NOW());

-- Kiểm tra
SELECT user_id, username, email, role, fullname, is_active 
FROM users 
WHERE role = 'ADMIN';
