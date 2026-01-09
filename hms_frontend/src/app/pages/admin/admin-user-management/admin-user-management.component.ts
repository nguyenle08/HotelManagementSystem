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

  // Form states
  showForm = false;
  isEditMode = false;
  formLoading = false;
  formError = '';
  
  formData: any = {
    userId: '',
    username: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'USER',
    password: '',
    status: 'ACTIVE'
  };

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

  openCreateForm(): void {
    this.isEditMode = false;
    this.showForm = true;
    this.formError = '';
    this.resetForm();
  }

  openEditForm(user: AdminUser): void {
    this.isEditMode = true;
    this.showForm = true;
    this.formError = '';
    this.formData = { ...user };
    this.scrollToForm();
  }

  cancelForm(): void {
    this.showForm = false;
    this.resetForm();
    this.formError = '';
  }

  resetForm(): void {
    this.formData = {
      userId: '',
      username: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'USER',
      password: '',
      status: 'ACTIVE'
    };
  }

  scrollToForm(): void {
    setTimeout(() => {
      const formElement = document.querySelector('.form-section');
      formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  onSubmitForm(): void {
    this.formError = '';
    this.formLoading = true;

    if (this.isEditMode) {
      this.adminService.updateUser(this.formData.userId, this.formData).subscribe({
        next: () => {
          this.formLoading = false;
          this.showForm = false;
          this.showSuccess('Cập nhật tài khoản thành công');
          this.loadUsers();
        },
        error: (err) => {
          this.formLoading = false;
          this.formError = 'Không thể cập nhật tài khoản: ' + (err?.error?.message || err.message || 'Lỗi không xác định');
        }
      });
    } else {
      this.adminService.createUser(this.formData).subscribe({
        next: () => {
          this.formLoading = false;
          this.showForm = false;
          this.showSuccess('Tạo tài khoản thành công');
          this.loadUsers();
        },
        error: (err) => {
          this.formLoading = false;
          this.formError = 'Không thể tạo tài khoản: ' + (err?.error?.message || err.message || 'Lỗi không xác định');
        }
      });
    }
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    this.adminService.getUsers().subscribe({
      next: (data) => {
        // Normalize incoming data so role/status shapes are consistent
        this.users = data.map(u => this.normalizeUser(u));
        this.filteredUsers = this.users.slice();
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

  /**
   * Normalize user payload coming from backend.
   * Some services return `role` as an array (`roles`) or with prefixes like `ROLE_MANAGER`.
   */
  normalizeUser(u: any): AdminUser {
    const roleRaw = (u.role ?? u.roles ?? (Array.isArray(u.roles) ? u.roles[0] : undefined));
    let role = '';
    if (Array.isArray(roleRaw)) {
      role = (roleRaw[0] || '').toString();
    } else {
      role = (roleRaw || '').toString();
    }

    // handle cases like 'ROLE_MANAGER' or 'Manager' or 'manager'
    role = role.toUpperCase().replace(/^ROLE_/i, '') || 'USER';

    const status = (u.status || '').toString().toUpperCase() || 'UNKNOWN';

    return {
      userId: u.userId || u.id || '',
      username: u.username || u.userName || '',
      fullName: u.fullName || u.full_name || '',
      email: u.email || '',
      phone: u.phone || '',
      password: u.password,
      role,
      status,
      lastLogin: u.lastLogin || u.last_login || ''
    };
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
          this.showSuccess('Đã khóa tài khoản thành công');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error locking user:', err);
          this.showError('Không thể khóa tài khoản');
        }
      });
    }
  }

  unlockUser(userId: string, username: string): void {
    if (confirm(`Bạn có chắc muốn mở khóa tài khoản "${username}"?`)) {
      this.adminService.unlockUser(userId).subscribe({
        next: () => {
          this.showSuccess('Đã mở khóa tài khoản thành công');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error unlocking user:', err);
          this.showError('Không thể mở khóa tài khoản');
        }
      });
    }
  }

  deleteUser(userId: string, username: string): void {
    if (confirm(`⚠️ CẢNH BÁO: Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản "${username}"?\n\nHành động này không thể hoàn tác!`)) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.showSuccess('Đã xóa tài khoản thành công');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.showError('Không thể xóa tài khoản');
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

  private showSuccess(message: string): void {
    // You can implement a toast notification here
    alert(message);
  }

  private showError(message: string): void {
    // You can implement a toast notification here
    alert(message);
  }
}