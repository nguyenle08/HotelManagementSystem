package com.hotel.user.controller;

import com.hotel.user.dto.AdminDashboardResponse;
import com.hotel.user.dto.AdminUserResponse;
import com.hotel.user.entity.Employee;
import com.hotel.user.entity.Guest;
import com.hotel.user.repository.EmployeeRepository;
import com.hotel.user.repository.GuestRepository;
import com.hotel.user.client.AuthClient;
import com.hotel.user.client.CreateAdminUserRequest;
import com.hotel.user.client.AuthResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final GuestRepository guestRepository;
    private final EmployeeRepository employeeRepository;
    private final AuthClient authClient;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard() {
        // Use Auth Service as source of truth for counts
        java.util.List<com.hotel.user.dto.AuthUserDTO> allUsers = authClient.getAllUsers();
        long total = allUsers.size();
        long activeUsers = allUsers.stream().filter(u -> Boolean.TRUE.equals(u.getIsActive())).count();
        long locked = allUsers.stream().filter(u -> !Boolean.TRUE.equals(u.getIsActive())).count();

        java.util.Map<String, Long> roleCount = new java.util.HashMap<>();
        for (com.hotel.user.dto.AuthUserDTO u : allUsers) {
            String roleRaw = u.getRole() != null ? u.getRole() : "USER";
            String role = roleRaw.toUpperCase().replace("ROLE_", "");
            roleCount.put(role, roleCount.getOrDefault(role, 0L) + 1);
        }

        List<AdminDashboardResponse.RoleStat> roleStats = new ArrayList<>();
        String[] standardRoles = new String[] {"ADMIN", "MANAGER", "STAFF", "USER"};
        for (String r : standardRoles) {
            long cnt = roleCount.getOrDefault(r, 0L);
            AdminDashboardResponse.RoleStat s = new AdminDashboardResponse.RoleStat();
            s.setRole(r);
            s.setCount(cnt);
            s.setPercent(total > 0 ? (cnt * 100.0 / total) : 0);
            roleStats.add(s);
        }

        AdminDashboardResponse res = new AdminDashboardResponse();
        res.setTotalUsers(total);
        res.setActiveUsers(activeUsers);
        res.setStaffCount(roleCount.getOrDefault("STAFF", 0L));
        res.setLockedAccounts(locked);
        res.setRoleStats(roleStats);
        res.setAccountStatus(new ArrayList<>());
        res.setRecentActivities(new ArrayList<>());

        return ResponseEntity.ok(res);
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getUsers() {
        List<AdminUserResponse> list = new ArrayList<>();
        try {
            java.util.List<com.hotel.user.dto.AuthUserDTO> all = authClient.getAllUsers();
            for (com.hotel.user.dto.AuthUserDTO au : all) {
                AdminUserResponse r = new AdminUserResponse();
                r.setUserId(au.getUserId());
                r.setUsername(au.getUsername());
                r.setFullName(au.getFullname() != null ? au.getFullname() : "");
                r.setEmail(au.getEmail());
                String roleRaw = au.getRole() != null ? au.getRole() : "USER";
                String role = roleRaw.toUpperCase().replace("ROLE_", "");
                r.setRole(role);
                r.setStatus(Boolean.TRUE.equals(au.getIsActive()) ? "ACTIVE" : "LOCKED");
                // Supplement with local data if exists
                guestRepository.findByUserId(au.getUserId()).ifPresent(g -> {
                    r.setPhone(g.getPhone());
                    if (r.getFullName() == null || r.getFullName().isEmpty()) {
                        r.setFullName(g.getFirstName() + " " + g.getLastName());
                    }
                });
                employeeRepository.findByUserId(au.getUserId()).ifPresent(e -> {
                    if (r.getFullName() == null || r.getFullName().isEmpty()) {
                        r.setFullName(e.getEmployeeCode());
                    }
                });

                r.setLastLogin(au.getLastLogin() != null ? au.getLastLogin() : "");
                list.add(r);
            }
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(new ArrayList<>());
        }

        return ResponseEntity.ok(list);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody AdminUserResponse req) {
        try {
            // Create user in Auth service
            CreateAdminUserRequest createReq = new CreateAdminUserRequest();
            createReq.setUsername(req.getUsername());
            createReq.setEmail(req.getEmail());
            createReq.setPhone(req.getPhone());
            // If frontend didn't provide password, set default (admin should force change)
            createReq.setPassword(req.getPassword() != null ? req.getPassword() : "ChangeMe123!");
            createReq.setFullname(req.getFullName());
            createReq.setRole(req.getRole() != null ? req.getRole() : "USER");

            var authRes = authClient.createUser(createReq);

            // Create local Guest or Employee record depending on role
            String role = authRes.getRole() != null ? authRes.getRole() : "USER";
            if ("USER".equalsIgnoreCase(role)) {
                Guest g = new Guest();
                g.setGuestId(java.util.UUID.randomUUID().toString());
                g.setUserId(authRes.getUserId());
                String[] parts = (authRes.getFullname() != null ? authRes.getFullname() : req.getFullName()).split(" ", 2);
                g.setFirstName(parts.length > 0 ? parts[0] : "");
                g.setLastName(parts.length > 1 ? parts[1] : "");
                g.setPhone(req.getPhone());
                guestRepository.save(g);
            } else {
                Employee e = new Employee();
                e.setEmployeeId(java.util.UUID.randomUUID().toString());
                e.setUserId(authRes.getUserId());
                e.setEmployeeCode("EMP" + System.currentTimeMillis()%10000);
                e.setCccd("");
                e.setDepartment("General");
                e.setPosition(req.getRole());
                e.setHireDate(java.time.LocalDate.now());
                employeeRepository.save(e);
            }

            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody AdminUserResponse req) {
        try {
            // Determine current role from Auth service
            var current = authClient.getUserById(userId);
            String oldRole = (current != null && current.getRole() != null) ? current.getRole().toUpperCase() : "USER";
            String newRole = (req.getRole() != null) ? req.getRole().toUpperCase() : oldRole;

            // Update Auth profile (name/phone)
            String fullName = req.getFullName() != null ? req.getFullName() : "";
            String firstName = "";
            String lastName = "";
            if (!fullName.isEmpty()) {
                String[] parts = fullName.split(" ", 2);
                firstName = parts[0];
                lastName = parts.length > 1 ? parts[1] : "";
            }
            authClient.updateProfile(userId, firstName, lastName, req.getPhone());

            // If role changed, update in Auth service and migrate local records
            if (!oldRole.equals(newRole)) {
                // update role in auth-service
                authClient.updateRole(userId, newRole);

                // If user was a guest and becomes employee-type
                if ("USER".equals(oldRole) && !"USER".equals(newRole)) {
                    guestRepository.findByUserId(userId).ifPresent(g -> guestRepository.delete(g));
                    Employee e = new Employee();
                    e.setEmployeeId(java.util.UUID.randomUUID().toString());
                    e.setUserId(userId);
                    e.setEmployeeCode("EMP" + System.currentTimeMillis()%10000);
                    e.setCccd("");
                    e.setDepartment("General");
                    e.setPosition(newRole);
                    e.setHireDate(java.time.LocalDate.now());
                    e.setIsActive(true);
                    employeeRepository.save(e);
                }

                // If user was employee-type and becomes USER
                if (!"USER".equals(oldRole) && "USER".equals(newRole)) {
                    employeeRepository.findByUserId(userId).ifPresent(e -> employeeRepository.delete(e));
                    Guest g = new Guest();
                    g.setGuestId(java.util.UUID.randomUUID().toString());
                    g.setUserId(userId);
                    String[] parts = (req.getFullName() != null ? req.getFullName() : "").split(" ", 2);
                    g.setFirstName(parts.length > 0 ? parts[0] : "");
                    g.setLastName(parts.length > 1 ? parts[1] : "");
                    g.setPhone(req.getPhone());
                    guestRepository.save(g);
                }
            }

            // Update local guest/employee fields if still present
            guestRepository.findByUserId(userId).ifPresent(g -> {
                if (req.getFullName() != null) {
                    String[] parts = req.getFullName().split(" ", 2);
                    g.setFirstName(parts[0]);
                    g.setLastName(parts.length > 1 ? parts[1] : "");
                }
                g.setPhone(req.getPhone());
                guestRepository.save(g);
            });

            employeeRepository.findByUserId(userId).ifPresent(e -> {
                e.setPosition(newRole);
                employeeRepository.save(e);
            });

            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }

    @PostMapping("/users/{userId}/lock")
    public ResponseEntity<?> lockUser(@PathVariable String userId) {
        try {
            authClient.lockUser(userId);
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }

    @PostMapping("/users/{userId}/unlock")
    public ResponseEntity<?> unlockUser(@PathVariable String userId) {
        try {
            authClient.unlockUser(userId);
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            // Delete guest or employee local records
            guestRepository.findByUserId(userId).ifPresent(g -> guestRepository.delete(g));
            employeeRepository.findByUserId(userId).ifPresent(e -> employeeRepository.delete(e));
            // Note: auth-service account deletion not implemented here
            return ResponseEntity.ok().build();
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }

    /**
     * One-time sync: import a user from auth-service into local guest/employee table.
     * Useful when an account is created directly in auth-service and not yet present locally.
     */
    @PostMapping("/sync-user/{userId}")
    public ResponseEntity<?> syncUser(@PathVariable String userId) {
        try {
            var au = authClient.getUserById(userId);
            if (au == null) return ResponseEntity.status(404).body("User not found in auth-service");

            String roleRaw = au.getRole() != null ? au.getRole() : "USER";
            String role = roleRaw.toUpperCase().replace("ROLE_", "");

            // If already exists as guest or employee, return ok
            if (guestRepository.findByUserId(userId).isPresent() || employeeRepository.findByUserId(userId).isPresent()) {
                return ResponseEntity.ok().body("User already synced");
            }

            String fullname = au.getFullname() != null ? au.getFullname() : "";

            if ("USER".equals(role)) {
                Guest g = new Guest();
                g.setGuestId(java.util.UUID.randomUUID().toString());
                g.setUserId(userId);
                String[] parts = fullname.split(" ", 2);
                g.setFirstName(parts.length > 0 ? parts[0] : "");
                g.setLastName(parts.length > 1 ? parts[1] : "");
                g.setPhone(au.getPhone());
                guestRepository.save(g);
                return ResponseEntity.ok().body("Guest created");
            } else {
                Employee e = new Employee();
                e.setEmployeeId(java.util.UUID.randomUUID().toString());
                e.setUserId(userId);
                e.setEmployeeCode("EMP" + System.currentTimeMillis()%10000);
                e.setCccd("");
                e.setAddress("");
                e.setDepartment("General");
                e.setPosition(role);
                e.setHireDate(java.time.LocalDate.now());
                e.setIsActive(true);
                employeeRepository.save(e);
                return ResponseEntity.ok().body("Employee created");
            }
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }
}
