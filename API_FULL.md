# Hệ thống - API Documentation (Full)

Tài liệu này liệt kê đầy đủ các endpoint của các service trong workspace (Gateway ánh xạ tới các service nội bộ).

## API Gateway (routes)
- Base URL: http://localhost:8080
- Mappings (gateway strips first path segment):
  - `/auth/**` -> auth-service
  - `/room/**` -> room-service
  - `/user/**` -> user-service
  - `/reservation/**` -> reservation-service
  - `/payment/**` -> payment-service

---

## 1) Auth Service
- Base URL: http://localhost:8081

### POST /api/auth/register
- Method: POST
- Headers: none
- Body: `RegisterRequest` JSON (email/username/password...)
- Success: 200
  ```json
  { "success": true, "message": "Đăng ký thành công", "data": { /* AuthResponse */ } }
  ```
- Error: 400 with `ApiResponse(false, message)`

### POST /api/auth/login
- Method: POST
- Body: `LoginRequest` (username/password)
- Success: 200 with `AuthResponse` containing JWT

### POST /api/auth/create-admin
- Method: POST
- Body: `CreateAdminRequest`
- Purpose: tạo admin đầu tiên

### POST /api/auth/admin/create-user
- Method: POST
- Body: `CreateUserByAdminRequest`
- Notes: intended for Admin only (security checks TODO)

### Internal endpoints (service-to-service)
Base: http://localhost:8081/api/internal

- GET /api/internal/users/{userId}
  - Method: GET
  - Returns: `UserProfileResponse` (userId, username, email, fullName, phone, role)
  - Notes: used by other services (Feign/OpenFeign) — no auth expected for internal call

- POST /api/internal/users/{userId}/lock
- POST /api/internal/users/{userId}/unlock
  - Methods: POST
  - Purpose: lock/unlock account (Auth service toggles `isActive`)

---

## 2) User Service
- Base URL: http://localhost:8082

### Public API
- POST /api/users
  - Create guest (body: `Guest`)

- GET /api/users
  - List all guests

- GET /api/users/me
  - Headers: `X-User-Id` (populated by API Gateway AuthenticationFilter)
  - Returns: `ProfileResponse`

- PUT /api/users/{userId}
  - Headers: `X-User-Id` must equal `{userId}`
  - Body: `UpdateProfileRequest`

### Internal API
- POST /internal/guests
  - Body: `CreateGuestRequest` (used by other services to create guest records)

### Admin API
- GET /api/admin/dashboard
  - Returns: `AdminDashboardResponse` (summary counts, role stats)

- GET /api/admin/users
  - Returns: list of `AdminUserResponse` (aggregates guest + employee info)

- POST /api/admin/users/{userId}/lock
- POST /api/admin/users/{userId}/unlock
  - Forwards to Auth service via `AuthClient`

- DELETE /api/admin/users/{userId}
  - Status: 501 Not Implemented

---

## 3) Room Service
- Base URL: http://localhost:8083

### Public API (room types and rooms)
- GET /api/rooms
  - List room types (wrapped in `ApiResponse`)

- GET /api/rooms/{id}
  - Get room type detail

- POST /api/rooms/search
  - Body: `RoomSearchRequest` — search available rooms

- GET /api/rooms/status
  - Get room statuses (availability snapshot)

- POST /api/rooms/manage
- PUT /api/rooms/manage/{id}
- DELETE /api/rooms/manage/{id}
  - CRUD for room records (admin)

### Room Type API
- GET /api/room-types
- GET /api/room-types/{id}
- POST /api/room-types
- PUT /api/room-types/{id}
- DELETE /api/room-types/{id}

- POST /api/room-types/upload-image
  - Form-data: `file` multipart
  - Returns `{ "url": "http://localhost:8080/room/api/room-types/image/<filename>" }`

- GET /api/room-types/image/{filename}
  - Serves image resources

### Internal API (inter-service)
- POST /internal/rooms/lock
  - Body: `LockRoomRequest` (reservationId, roomTypeId, checkInDate, checkOutDate)
  - Purpose: lock rooms when reservation created

- POST /internal/rooms/unlock
  - Body: `UnlockRoomRequest` (reservationId)

- DELETE /internal/rooms/availability/cleanup?afterDate=YYYY-MM-DD
  - Maintenance/testing endpoint to remove availability records

---

## 4) Reservation Service
- Base URL: http://localhost:8084

### Public API (requires JWT via `Authorization: Bearer <token>`)
- POST /api/reservations
  - Body: `CreateReservationRequest`
  - Auth: user JWT
  - Returns: `ApiResponse<ReservationResponse>`

- GET /api/reservations/my-reservations
  - Auth: user JWT
  - Returns list of reservations for authenticated user

- GET /api/reservations/all
  - Admin/Staff list all reservations (note: role check TODO)

- GET /api/reservations/{reservationId}
  - Auth: user JWT
  - Returns: `ReservationDetailResponse` (guest info prioritized from reservation, fallback to Auth service `GET /api/internal/users/{userId}` via Feign)

- DELETE /api/reservations/{reservationId}/cancel
  - Auth: user JWT
  - Possible responses: 200 OK, 400 Bad Request, 404 Not Found

- PUT /api/reservations/{reservationId}/check-in
  - Auth: staff/user JWT
  - Returns: updated `ReservationResponse`

- PUT /api/reservations/{reservationId}/check-out
  - Auth: staff/user JWT
  - Returns: updated `ReservationResponse`

- PUT /api/reservations/{reservationId}/payment?status=PAID|FAILED
  - Public used by `payment-service` to update payment status

- GET /api/reservations/dashboard
  - Returns: `DashboardResponse` (today actions, room snapshot, alerts)

Notes:
- `GET /api/reservations/{id}` uses `UserServiceClient` (OpenFeign) to call Auth service internal user endpoint if reservation doesn't contain guest info.

---

## 5) Payment Service
- Base URL: http://localhost:8085

- POST /api/payment/vnpay/create
  - Body: `VNPayRequest` (amount, order info, returnUrl, reservationId, ...)
  - Returns: `VNPayResponse` with `paymentUrl`

- GET /api/payment/vnpay/callback
  - Query params: VNPay returns many params (vnp_ResponseCode, vnp_OrderInfo, etc.)
  - Behavior: verifies signature (currently disabled in code for testing), updates reservation payment status by calling reservation-service `/api/reservations/{reservationId}/payment?status=PAID|FAILED`

Notes:
- VNPay config in `application.properties` (tmn-code, hash-secret, vnpay.url, return-url).

---

## 6) Other services / notes
- Discovery server (Eureka) runs on default zone `http://localhost:8761/eureka/` — used for service registration.
- Notification service exists in workspace; check its controller(s) if notification endpoints are needed.

---

## Conventions & Response formats
- Most services wrap responses in `ApiResponse<T>` with shape:
  ```json
  { "success": true|false, "message": "...", "data": { ... } }
  ```
- Internal APIs use simple DTOs (e.g., `UserProfileResponse`) and may be unauthenticated for inter-service calls.
- API Gateway applies `AuthenticationFilter` that copies `Authorization` header downstream and injects `X-User-*` headers for convenience.

---

## Next steps (options)
- (A) Generate machine-readable JSON of endpoints by parsing annotations.
- (B) Add request/response schemas for each DTO used in endpoints.
- (C) Produce a compact summary file `API_SUMMARY.md`.

Pick one option or ask for edits; tôi sẽ tiếp tục tự động cập nhật tài liệu.
