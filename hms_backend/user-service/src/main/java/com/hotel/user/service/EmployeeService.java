package com.hotel.user.service;

import com.hotel.user.entity.Employee;
import com.hotel.user.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository repo;

    public List<Employee> getAll() {
        return repo.findAll();
    }

    public Employee create(Employee e) {
        e.setEmployeeId(UUID.randomUUID().toString());

        // TẠM THỜI (sau này lấy từ auth-service)
        e.setUserId(UUID.randomUUID().toString());

        if (e.getCccd() == null) {
            e.setCccd("UNKNOWN");
        }

        if (e.getHireDate() == null) {
            e.setHireDate(LocalDate.now());
        }

        e.setIsActive(true);
        return repo.save(e);
    }

    public Employee update(String id, Employee req) {
        Employee e = repo.findById(id).orElseThrow();

        e.setFullname(req.getFullname());
        e.setPhone(req.getPhone());
        e.setDepartment(req.getDepartment());
        e.setPosition(req.getPosition());
        e.setSalary(req.getSalary());
        e.setHireDate(req.getHireDate());

        return repo.save(e);
    }

    public void lock(String id) {
        Employee e = repo.findById(id).orElseThrow();
        e.setIsActive(false);
        repo.save(e);
    }

    public void unlock(String id) {
        Employee e = repo.findById(id).orElseThrow();
        e.setIsActive(true);
        repo.save(e);
    }
}
