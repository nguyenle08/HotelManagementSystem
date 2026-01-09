package com.hotel.user.controller;

import com.hotel.user.dto.AdminDashboardResponse;
import com.hotel.user.dto.AdminUserResponse;
import com.hotel.user.entity.Employee;
import com.hotel.user.entity.Guest;
import com.hotel.user.repository.EmployeeRepository;
import com.hotel.user.repository.GuestRepository;
import com.hotel.user.client.AuthClient;
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
        long guestCount = guestRepository.count();
        long empCount = employeeRepository.count();
        long total = guestCount + empCount;
        long staffCount = empCount;
        long activeEmployees = employeeRepository.countByIsActiveTrue();
        long activeUsers = guestCount + activeEmployees;

        // Build role stats by querying auth service for each user (best-effort)
        List<AdminDashboardResponse.RoleStat> roleStats = new ArrayList<>();
        // Simple aggregation: count roles by calling auth client for guests and employees
        java.util.Map<String, Long> roleCount = new java.util.HashMap<>();

        List<String> allUserIds = new ArrayList<>();
        guestRepository.findAll().forEach(g -> allUserIds.add(g.getUserId()));
        employeeRepository.findAll().forEach(e -> allUserIds.add(e.getUserId()));

        for (String uid : allUserIds) {
            try {
                var user = authClient.getUserById(uid);
                String role = user.getRole() != null ? user.getRole() : "USER";
                roleCount.put(role, roleCount.getOrDefault(role, 0L) + 1);
            } catch (Exception ex) {
                // ignore
            }
        }

        for (var entry : roleCount.entrySet()) {
            AdminDashboardResponse.RoleStat s = new AdminDashboardResponse.RoleStat();
            s.setRole(entry.getKey());
            s.setCount(entry.getValue());
            s.setPercent(total > 0 ? (entry.getValue() * 100.0 / total) : 0);
            roleStats.add(s);
        }

        AdminDashboardResponse res = new AdminDashboardResponse();
        res.setTotalUsers(total);
        res.setActiveUsers(activeUsers);
        res.setStaffCount(staffCount);
        res.setLockedAccounts(0); // placeholder: auth-service can provide exact number
        res.setRoleStats(roleStats);
        res.setAccountStatus(new ArrayList<>());
        res.setRecentActivities(new ArrayList<>());

        return ResponseEntity.ok(res);
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getUsers() {
        List<AdminUserResponse> list = new ArrayList<>();

        // Guests
        List<Guest> guests = guestRepository.findAll();
        for (Guest g : guests) {
            AdminUserResponse r = new AdminUserResponse();
            r.setUserId(g.getUserId());
            try {
                var au = authClient.getUserById(g.getUserId());
                r.setUsername(au.getUsername());
                r.setFullName(au.getFullname());
                // AuthUserDTO in this service does not expose email; leave null
                r.setEmail(null);
                r.setRole(au.getRole());
                r.setStatus("ACTIVE");
            } catch (Exception e) {
                r.setUsername(null);
                r.setFullName(g.getFirstName() + " " + g.getLastName());
                r.setEmail(null);
                r.setRole("USER");
                r.setStatus("UNKNOWN");
            }
            r.setPhone(g.getPhone());
            r.setLastLogin("");
            list.add(r);
        }

        // Employees
        List<Employee> emps = employeeRepository.findAll();
        for (Employee e : emps) {
            AdminUserResponse r = new AdminUserResponse();
            r.setUserId(e.getUserId());
            try {
                var au = authClient.getUserById(e.getUserId());
                r.setUsername(au.getUsername());
                r.setFullName(au.getFullname());
                r.setEmail(null);
                r.setRole(au.getRole());
                r.setStatus(e.getIsActive() ? "ACTIVE" : "LOCKED");
            } catch (Exception ex) {
                r.setUsername(null);
                r.setFullName(e.getEmployeeCode());
                r.setEmail(null);
                r.setRole("STAFF");
                r.setStatus(e.getIsActive() ? "ACTIVE" : "LOCKED");
            }
            r.setPhone(null);
            r.setLastLogin("");
            list.add(r);
        }

        return ResponseEntity.ok(list);
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
        // Deleting user may involve multiple tables; provide simple response
        return ResponseEntity.status(501).body("Not implemented");
    }
}
