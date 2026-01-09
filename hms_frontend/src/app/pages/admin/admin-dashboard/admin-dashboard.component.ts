import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { AdminDashboardStats } from '../../../models/admin-dashboard.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats?: AdminDashboardStats;
  loading = true;
  error = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Dashboard error:', err);
        this.error = 'Không thể tải dữ liệu dashboard';
        this.loading = false;
      }
    });
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'ADMIN': 'role-admin',
      'MANAGER': 'role-manager',
      'STAFF': 'role-staff',
      'USER': 'role-user'
    };
    return colors[role] || 'role-default';
  }

  getRolePercentage(count: number): number {
    if (!this.stats || this.stats.totalUsers === 0) return 0;
    return (count / this.stats.totalUsers) * 100;
  }

  getActivePercentage(): number {
    if (!this.stats || this.stats.totalUsers === 0) return 0;
    return (this.stats.activeUsers / this.stats.totalUsers) * 100;
  }

  getLockedPercentage(): number {
    if (!this.stats || this.stats.totalUsers === 0) return 0;
    return (this.stats.lockedAccounts / this.stats.totalUsers) * 100;
  }
}