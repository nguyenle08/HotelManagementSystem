-- ============================================================================
-- AUTH SERVICE DATABASE
-- ============================================================================
DROP DATABASE IF EXISTS auth_service_db;
CREATE DATABASE auth_service_db;
USE auth_service_db;

CREATE TABLE users (
    user_id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER', -- USER / STAFF / MANAGER / ADMIN
    fullname VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    token_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    permission_id CHAR(36) PRIMARY KEY,
    permission_code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE role_permissions (
    role VARCHAR(20) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    PRIMARY KEY (role, permission_id)
);

-- Bảng mới: để reset password
CREATE TABLE password_reset_tokens (
    token_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);

-- ============================================================================
-- USER SERVICE DATABASE
-- ============================================================================
DROP DATABASE IF EXISTS user_service_db;
CREATE DATABASE user_service_db;
USE user_service_db;

CREATE TABLE guests (
    guest_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) UNIQUE NOT NULL,
    cccd VARCHAR(20),
    address VARCHAR(255),
    loyalty_points INT DEFAULT 0,
    member_tier VARCHAR(20) DEFAULT 'BRONZE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    employee_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) UNIQUE NOT NULL,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    cccd VARCHAR(20) NOT NULL,
    address VARCHAR(255),
    department VARCHAR(50) NOT NULL,
    position VARCHAR(100),
    hire_date DATE NOT NULL,
    salary DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_guest_user ON guests(user_id);
CREATE INDEX idx_employee_user ON employees(user_id);

-- ============================================================================
-- ROOM SERVICE DATABASE
-- ============================================================================
DROP DATABASE IF EXISTS room_service_db;
CREATE DATABASE room_service_db;
USE room_service_db;

CREATE TABLE room_types (
    room_type_id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    max_guests INT NOT NULL,
    bed_type VARCHAR(20),
    size_sqm DECIMAL(6,2),
    amenities JSON,
    images JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    room_id CHAR(36) PRIMARY KEY,
    room_type_id CHAR(36) NOT NULL,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    floor INT NOT NULL,
    -- Sửa: Tách status vật lý và status đặt phòng
    status VARCHAR(20) DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE','MAINTENANCE','DECOMMISSIONED'))
);

CREATE TABLE room_availability (
    availability_id CHAR(36) PRIMARY KEY,
    room_id CHAR(36) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL 
        CHECK (status IN ('AVAILABLE','RESERVED','OCCUPIED','BLOCKED')),
    reservation_id CHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (room_id, date)
);

CREATE INDEX idx_room_type_active ON room_types(is_active);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_availability_date ON room_availability(date);
CREATE INDEX idx_availability_room_date ON room_availability(room_id, date);

-- ============================================================================
-- RESERVATION SERVICE DATABASE
-- ============================================================================
DROP DATABASE IF EXISTS reservation_service_db;
CREATE DATABASE reservation_service_db;
USE reservation_service_db;

CREATE TABLE reservations (
    reservation_id CHAR(36) PRIMARY KEY,
    reservation_code VARCHAR(30) UNIQUE NOT NULL,
    guest_id CHAR(36) NOT NULL,
    
    room_type_id CHAR(36) NOT NULL,
    room_type_name VARCHAR(100) NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_adults INT DEFAULT 1,
    num_children INT DEFAULT 0,
    
    total_amount DECIMAL(12,2) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','NO_SHOW')),
    
    special_requests TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CHECK (check_out_date > check_in_date)
);

-- Bảng mới: Gán phòng cụ thể cho reservation
CREATE TABLE reservation_rooms (
    assignment_id CHAR(36) PRIMARY KEY,
    reservation_id CHAR(36) NOT NULL,
    room_id CHAR(36) NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by CHAR(36), -- employee_id
    UNIQUE (reservation_id, room_id)
);

-- Bảng mới: Lịch sử thay đổi trạng thái reservation
CREATE TABLE reservation_status_history (
    history_id CHAR(36) PRIMARY KEY,
    reservation_id CHAR(36) NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by CHAR(36),
    notes TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservation_guest ON reservations(guest_id);
CREATE INDEX idx_reservation_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX idx_reservation_status ON reservations(status);

-- ============================================================================
-- PAYMENT SERVICE DATABASE
-- ============================================================================
DROP DATABASE IF EXISTS payment_service_db;
CREATE DATABASE payment_service_db;
USE payment_service_db;

CREATE TABLE payments (
    payment_id CHAR(36) PRIMARY KEY,
    reservation_id CHAR(36) NOT NULL,
    payment_type VARCHAR(20) DEFAULT 'FULL', -- DEPOSIT / FULL / REFUND
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','PAID','FAILED','REFUNDED')),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_transactions (
    transaction_id CHAR(36) PRIMARY KEY,
    payment_id CHAR(36) NOT NULL,
    gateway VARCHAR(30), -- VNPAY / MOMO / ZALOPAY
    gateway_txn_id VARCHAR(100),
    method VARCHAR(30), -- CASH / CARD / BANK_TRANSFER / E_WALLET
    amount DECIMAL(12,2),
    status VARCHAR(20),
    raw_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_reservation ON payments(reservation_id);
CREATE INDEX idx_transaction_payment ON payment_transactions(payment_id);

-- ============================================================================
-- NOTIFICATION SERVICE DATABASE
-- ============================================================================
DROP DATABASE IF EXISTS notification_service_db;
CREATE DATABASE notification_service_db;
USE notification_service_db;

CREATE TABLE notifications (
    notification_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    type VARCHAR(20) DEFAULT 'EMAIL',
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','SENT','FAILED')),
    retry_count INT DEFAULT 0,
    last_retry_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_templates (
    template_id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(30)
);

CREATE INDEX idx_notification_user ON notifications(user_id);
CREATE INDEX idx_notification_status ON notifications(status);

-- ============================================================================
-- DATA SEEDS
-- ============================================================================

-- Seed email templates
INSERT INTO email_templates (template_id, name, code, subject, body, category) VALUES
(UUID(), 'Xác nhận đặt phòng', 'BOOKING_CONFIRMATION', 
 'Xác nhận đặt phòng #{{reservation_code}}',
 'Xin chào {{guest_name}}, đặt phòng của bạn đã được xác nhận. Mã đặt phòng: {{reservation_code}}',
 'BOOKING'),

(UUID(), 'Thanh toán thành công', 'PAYMENT_SUCCESS',
 'Thanh toán thành công',
 'Cảm ơn {{guest_name}} đã thanh toán. Số tiền: {{amount}}',
 'PAYMENT');
