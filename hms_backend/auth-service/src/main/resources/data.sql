-- ==============================================
-- HOTEL MANAGEMENT SYSTEM - INITIAL DATA
-- ==============================================
-- Tạo admin đầu tiên cho hệ thống
-- Username: admin
-- Password: admin123 (đã mã hóa BCrypt)
-- ==============================================
-- LƯU Ý: 
-- - Có thể comment file này và tạo admin qua Postman: POST /api/auth/create-admin
-- - Hoặc để file này chạy tự động khi start service
-- ==============================================

-- Xóa dữ liệu cũ (nếu có)
-- DELETE FROM users WHERE username = 'admin';

-- Tạo tài khoản admin đầu tiên
-- Password: admin123
-- BCrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMye1IVI5bUU91vmHx0pBd5bBmYhBP0DcKy
INSERT INTO users (username, email, phone, password, fullname, role, is_active, is_verified, created_at)
VALUES 
('admin', 'admin@hotel.com', '0900000000', '$2a$10$N9qo8uLOickgx2ZMRZoMye1IVI5bUU91vmHx0pBd5bBmYhBP0DcKy', 'Administrator', 'ADMIN', true, true, NOW())
ON DUPLICATE KEY UPDATE username = username; -- Không insert nếu đã tồn tại

-- ==============================================
-- Hướng dẫn sử dụng:
-- 1. Admin đăng nhập với username: admin / password: admin123
-- 2. Admin tạo tài khoản MANAGER, STAFF, USER qua API /api/auth/admin/create-user
-- 3. Các tài khoản mới được admin tạo sẽ tự động active và verified
-- ==============================================
