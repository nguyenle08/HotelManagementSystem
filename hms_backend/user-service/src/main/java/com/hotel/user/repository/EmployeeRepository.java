package com.hotel.user.repository;

import com.hotel.user.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, String> {

    Optional<Employee> findByUserId(String userId);
    List<Employee> findByDepartment(String department);

    List<Employee> findByIsActive(Boolean isActive);
    long countByIsActiveTrue();
}
