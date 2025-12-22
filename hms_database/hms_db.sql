DROP DATABASE IF EXISTS auth_service_db;
CREATE DATABASE auth_service_db;
USE auth_service_db;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,  -- dùng để login
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,       -- họ
    last_name VARCHAR(50) NOT NULL,        -- tên
    phone VARCHAR(20),
    cccd VARCHAR(20),
    address VARCHAR(255),
    role VARCHAR(20) NOT NULL,             -- USER / STAFF / MANAGER / ADMIN
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- REFRESH TOKENS
-- =========================
CREATE TABLE refresh_tokens (
    token_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================
-- PERMISSIONS
-- =========================
CREATE TABLE permissions (
    permission_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    permission_code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
) ENGINE=InnoDB;

-- =========================
-- ROLE - PERMISSION
-- =========================
CREATE TABLE role_permissions (
    role VARCHAR(20) NOT NULL,
    permission_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (role, permission_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
) ENGINE=InnoDB;

-- =========================
-- INDEX
-- =========================
CREATE INDEX idx_users_username ON users(username); -- login bằng username
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);

CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_expires ON refresh_tokens(expires_at);

CREATE INDEX idx_permission_code ON permissions(permission_code);
CREATE INDEX idx_role_permission_role ON role_permissions(role);



DROP DATABASE IF EXISTS user_service_db;
CREATE DATABASE user_service_db;
USE user_service_db;

-- =========================
-- GUESTS
-- =========================
CREATE TABLE guests (
    guest_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    cccd VARCHAR(20),
    address VARCHAR(255),
    loyalty_points INT DEFAULT 0,
    member_tier VARCHAR(20) DEFAULT 'BRONZE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- EMPLOYEES
-- =========================
CREATE TABLE employees (
    employee_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) UNIQUE NOT NULL,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    cccd VARCHAR(20),
    address VARCHAR(255),
    department VARCHAR(50) NOT NULL,
    position VARCHAR(100),
    hire_date DATE NOT NULL,
    salary DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- INDEX
-- =========================
CREATE INDEX idx_guest_user ON guests(user_id);
CREATE INDEX idx_guest_phone ON guests(phone);

CREATE INDEX idx_employee_user ON employees(user_id);
CREATE INDEX idx_employee_code ON employees(employee_code);
CREATE INDEX idx_employee_department ON employees(department);


DROP DATABASE IF EXISTS room_service_db;
CREATE DATABASE room_service_db;
USE room_service_db;

-- =========================
-- ROOM TYPES
-- =========================
CREATE TABLE room_types (
    room_type_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
) ENGINE=InnoDB;

-- =========================
-- ROOMS
-- =========================
CREATE TABLE rooms (
    room_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    room_type_id VARCHAR(36) NOT NULL,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    floor INT NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id)
) ENGINE=InnoDB;

-- =========================
-- ROOM AVAILABILITY
-- =========================
CREATE TABLE room_availability (
    availability_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    room_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    reservation_id VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    UNIQUE (room_id, date)
) ENGINE=InnoDB;

-- =========================
-- INDEX
-- =========================
CREATE INDEX idx_room_type_active ON room_types(is_active);

CREATE INDEX idx_rooms_type ON rooms(room_type_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_floor ON rooms(floor);

CREATE INDEX idx_availability_room_date ON room_availability(room_id, date);
CREATE INDEX idx_availability_date_status ON room_availability(date, status);
CREATE INDEX idx_availability_reservation ON room_availability(reservation_id);


DROP DATABASE IF EXISTS reservation_service_db;
CREATE DATABASE reservation_service_db;
USE reservation_service_db;

CREATE TABLE reservations (
    reservation_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reservation_code VARCHAR(30) UNIQUE NOT NULL,
    guest_id VARCHAR(36) NOT NULL,
    room_type_id VARCHAR(36) NOT NULL,
    assigned_room_id VARCHAR(36),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_adults INT DEFAULT 1,
    num_children INT DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (check_out_date > check_in_date)
) ENGINE=InnoDB;

-- =========================
-- INDEX
-- =========================
CREATE INDEX idx_reservation_code ON reservations(reservation_code);
CREATE INDEX idx_reservation_guest ON reservations(guest_id);
CREATE INDEX idx_reservation_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX idx_reservation_status ON reservations(status);
CREATE INDEX idx_assigned_room ON reservations(assigned_room_id);


DROP DATABASE IF EXISTS payment_service_db;
CREATE DATABASE payment_service_db;
USE payment_service_db;

CREATE TABLE payments (
    payment_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    reservation_id VARCHAR(36) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE payment_transactions (
    transaction_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    payment_id VARCHAR(36) NOT NULL,
    gateway VARCHAR(30),
    gateway_txn_id VARCHAR(100),
    method VARCHAR(30),
    amount DECIMAL(12,2),
    status VARCHAR(20),
    raw_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id)
) ENGINE=InnoDB;

-- =========================
-- INDEX
-- =========================
CREATE INDEX idx_payment_reservation ON payments(reservation_id);
CREATE INDEX idx_payment_status ON payments(status);

CREATE INDEX idx_transaction_payment ON payment_transactions(payment_id);
CREATE INDEX idx_transaction_gateway ON payment_transactions(gateway);
CREATE INDEX idx_transaction_status ON payment_transactions(status);


DROP DATABASE IF EXISTS notification_service_db;
CREATE DATABASE notification_service_db;
USE notification_service_db;

CREATE TABLE notifications (
    notification_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(20) DEFAULT 'EMAIL',
    recipient VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE email_templates (
    template_id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(30)
) ENGINE=InnoDB;

-- =========================
-- INDEX
-- =========================
CREATE INDEX idx_notification_user ON notifications(user_id);
CREATE INDEX idx_notification_status ON notifications(status);
CREATE INDEX idx_notification_type ON notifications(type);

CREATE INDEX idx_email_template_category ON email_templates(category);


USE auth_service_db;

INSERT INTO permissions (permission_code, description) VALUES
('ROOM_VIEW', 'View room information'),
('ROOM_CREATE', 'Create new room'),
('ROOM_UPDATE', 'Update room'),
('ROOM_DELETE', 'Delete room'),
('ROOM_MAINTENANCE', 'Set room maintenance'),
('RESERVATION_VIEW', 'View reservations'),
('CHECK_IN', 'Check-in guest'),
('CHECK_OUT', 'Check-out guest'),
('USER_MANAGE', 'Manage users');

-- STAFF
INSERT INTO role_permissions VALUES
('STAFF', (SELECT permission_id FROM permissions WHERE permission_code='ROOM_VIEW')),
('STAFF', (SELECT permission_id FROM permissions WHERE permission_code='RESERVATION_VIEW')),
('STAFF', (SELECT permission_id FROM permissions WHERE permission_code='CHECK_IN')),
('STAFF', (SELECT permission_id FROM permissions WHERE permission_code='CHECK_OUT'));

-- MANAGER
INSERT INTO role_permissions VALUES
('MANAGER', (SELECT permission_id FROM permissions WHERE permission_code='ROOM_VIEW')),
('MANAGER', (SELECT permission_id FROM permissions WHERE permission_code='ROOM_CREATE')),
('MANAGER', (SELECT permission_id FROM permissions WHERE permission_code='ROOM_UPDATE')),
('MANAGER', (SELECT permission_id FROM permissions WHERE permission_code='ROOM_MAINTENANCE')),
('MANAGER', (SELECT permission_id FROM permissions WHERE permission_code='RESERVATION_VIEW'));

-- ADMIN (ALL)
INSERT INTO role_permissions
SELECT 'ADMIN', permission_id FROM permissions;
