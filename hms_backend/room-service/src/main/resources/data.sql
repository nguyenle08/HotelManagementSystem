-- Sample Room Types
INSERT INTO room_types (room_type_id, name, description, base_price, max_guests, bed_type, size_sqm, amenities, images, is_active, created_at, updated_at) VALUES
('rt-1', 'Standard Room', 'Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản', 50.00, 2, 'Queen', 25.00, '["WiFi", "TV", "Air Conditioning", "Mini Bar"]', '["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"]', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rt-2', 'Deluxe Room', 'Phòng cao cấp với view đẹp và không gian rộng rãi', 80.00, 2, 'King', 35.00, '["WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony", "Coffee Maker"]', '["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"]', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rt-3', 'Family Suite', 'Suite gia đình với 2 phòng ngủ riêng biệt', 150.00, 4, 'King + Twin', 60.00, '["WiFi", "TV", "Air Conditioning", "Mini Bar", "Kitchen", "Living Room", "Balcony"]', '["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"]', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rt-4', 'Presidential Suite', 'Phòng VIP cao cấp nhất với đầy đủ tiện nghi sang trọng', 300.00, 4, 'King', 100.00, '["WiFi", "TV", "Air Conditioning", "Mini Bar", "Kitchen", "Living Room", "Balcony", "Jacuzzi", "Butler Service"]', '["https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800"]', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sample Rooms
INSERT INTO rooms (room_id, room_number, room_type_id, floor, status) VALUES
('r-101', '101', 'rt-1', 1, 'ACTIVE'),
('r-102', '102', 'rt-1', 1, 'ACTIVE'),
('r-103', '103', 'rt-1', 1, 'ACTIVE'),
('r-201', '201', 'rt-2', 2, 'ACTIVE'),
('r-202', '202', 'rt-2', 2, 'ACTIVE'),
('r-301', '301', 'rt-3', 3, 'ACTIVE'),
('r-302', '302', 'rt-3', 3, 'ACTIVE'),
('r-401', '401', 'rt-4', 4, 'ACTIVE');
