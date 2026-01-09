import { Component } from '@angular/core';
import { EmployeeService } from '../../../services/employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-management.component.html',
  styleUrl: './employee-management.component.css'
})
export class EmployeeManagementComponent {

  employees: any[] = [];
  employee: any = {};
  showForm = false;
  isEdit = false;

  constructor(private service: EmployeeService) {
    this.load();
  }

  load() {
    this.service.getAll().subscribe({
      next: res => this.employees = res || [],
      error: err => {
        console.error('API error', err);
        this.employees = [];
      }
    });
  }

  edit(e: any) {
    this.employee = { ...e };
  }

  openCreate() {
    this.employee = {};
    this.isEdit = false;
    this.showForm = true;
  }

  openEdit(e: any) {
    this.employee = { ...e };
    this.isEdit = true;
    this.showForm = true;
  }

  cancel() {
    this.employee = {};
    this.showForm = false;
  }

  save() {
    if (!this.employee.employeeCode ||
        !this.employee.fullname ||
        !this.employee.department) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (this.isEdit) {
      this.service.update(this.employee.employeeId, this.employee)
        .subscribe(() => {
          this.load();
          this.cancel();
        });
    } else {
      this.service.create(this.employee)
        .subscribe(() => {
          this.load();
          this.cancel();
        });
    }
  }

  delete(id: number) {
    if (confirm('Xóa nhân viên?')) {
      this.service.delete(id).subscribe(() => this.load());
    }
  }

  lock(e: any) {
    if (confirm('Khóa nhân viên này?')) {
      this.service.lock(e.employeeId)
        .subscribe(() => this.load());
    }
  }

  unlock(e: any) {
    if (confirm('Mở lại nhân viên này?')) {
      this.service.unlock(e.employeeId)
        .subscribe(() => this.load());
    }
  }

  view(e: any) {
    alert(
      `Nhân viên: ${e.employeeCode}\n` +
      `Phòng ban: ${e.department}\n` +
      `Lương: ${e.salary}`
    );
  }
}
