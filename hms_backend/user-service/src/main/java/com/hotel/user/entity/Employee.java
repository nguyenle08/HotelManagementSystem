package com.hotel.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "employees")
@Data
public class Employee {

    @Id
    @Column(name = "employee_id", length = 36)
    private String employeeId;

    @Column(name = "user_id", length = 36, unique = true, nullable = false)
    private String userId;

    @Column(name = "employee_code", length = 20, unique = true, nullable = false)
    private String employeeCode;

    @Column(length = 20, nullable = false)
    private String cccd;

    @Column(length = 255)
    private String address;

    @Column(length = 50, nullable = false)
    private String department;

    @Column(length = 100)
    private String position;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(precision = 15, scale = 2)
    private BigDecimal salary;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

