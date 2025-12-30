-- Migration: Cập nhật thông tin guest cho reservations hiện có
USE reservation_service_db;

-- Tạm thời set giá trị mặc định cho các reservation chưa có thông tin guest
UPDATE reservations 
SET 
  guest_full_name = COALESCE(guest_full_name, 'Guest User'),
  guest_email = COALESCE(guest_email, CONCAT('guest_', user_id, '@example.com')),
  guest_phone = COALESCE(guest_phone, '0000000000')
WHERE 
  guest_full_name IS NULL 
  OR guest_email IS NULL 
  OR guest_phone IS NULL;
