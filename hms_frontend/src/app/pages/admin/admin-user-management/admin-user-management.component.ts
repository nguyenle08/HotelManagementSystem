import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { AdminUser } from '../../../models/admin-dashboard.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.css']
})
export class AdminUserManagementComponent implements OnInit {
  users: AdminUser[] = [];
  filteredUsers: AdminUser[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  selectedRole = 'all';
  selectedStatus = 'all';

  // Statistics
  totalUsers = 0;
  activeUsers = 0;
  lockedUsers = 0;
  adminCount = 0;
  managerCount = 0;
  staffCount = 0;
  userCount = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Không thể tải danh sách người dùng';
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => u.status === 'ACTIVE').length;
    this.lockedUsers = this.users.filter(u => u.status === 'LOCKED').length;
    this.adminCount = this.users.filter(u => u.role === 'ADMIN').length;
    this.managerCount = this.users.filter(u => u.role === 'MANAGER').length;
    this.staffCount = this.users.filter(u => u.role === 'STAFF').length;
    this.userCount = this.users.filter(u => u.role === 'USER').length;
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.username?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.phone?.includes(this.searchTerm);

      const matchesRole = this.selectedRole === 'all' || user.role === this.selectedRole;
      const matchesStatus = this.selectedStatus === 'all' || user.status === this.selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onRoleFilterChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  lockUser(userId: string, username: string): void {
    if (confirm(`Bạn có chắc muốn khóa tài khoản "${username}"?`)) {
      this.adminService.lockUser(userId).subscribe({
        next: () => {
          alert('Đã khóa tài khoản thành công');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error locking user:', err);
          alert('Không thể khóa tài khoản');
        }
      });
    }
  }

  unlockUser(userId: string, username: string): void {
    if (confirm(`Bạn có chắc muốn mở khóa tài khoản "${username}"?`)) {
      this.adminService.unlockUser(userId).subscribe({
        next: () => {
          alert('Đã mở khóa tài khoản thành công');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error unlocking user:', err);
          alert('Không thể mở khóa tài khoản');
        }
      });
    }
  }

  deleteUser(userId: string, username: string): void {
    if (confirm(`⚠️ CẢNH BÁO: Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản "${username}"?\n\nHành động này không thể hoàn tác!`)) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          alert('Đã xóa tài khoản thành công');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Chức năng xóa tài khoản chưa được triển khai');
        }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    const classes: { [key: string]: string } = {
      'ADMIN': 'badge-admin',
      'MANAGER': 'badge-manager',
      'STAFF': 'badge-staff',
      'USER': 'badge-user'
    };
    return classes[role] || 'badge-default';
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'ACTIVE': 'badge-active',
      'LOCKED': 'badge-locked',
      'UNKNOWN': 'badge-unknown'
    };
    return classes[status] || 'badge-default';
  }

  exportToCSV(): void {
    // Simple CSV export functionality
    const headers = ['Username', 'Full Name', 'Email', 'Phone', 'Role', 'Status'];
    const rows = this.filteredUsers.map(u => [
      u.username || '',
      u.fullName || '',
      u.email || '',
      u.phone || '',
      u.role || '',
      u.status || ''
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(field => `"${field}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
}