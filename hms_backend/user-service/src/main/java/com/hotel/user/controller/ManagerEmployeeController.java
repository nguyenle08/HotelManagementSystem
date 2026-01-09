package com.hotel.user.controller;

import com.hotel.user.entity.Employee;
import com.hotel.user.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/employees")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ManagerEmployeeController {

    private final EmployeeService service;

    @GetMapping
    public List<Employee> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Employee create(@RequestBody Employee e) {
        return service.create(e);
    }

    @PutMapping("/{id}")
    public Employee update(@PathVariable String id,
                           @RequestBody Employee e) {
        return service.update(id, e);
    }

    @PatchMapping("/{id}/lock")
    public void lock(@PathVariable String id) {
        service.lock(id);
    }

    @PatchMapping("/{id}/unlock")
    public void unlock(@PathVariable String id) {
        service.unlock(id);
    }
}
