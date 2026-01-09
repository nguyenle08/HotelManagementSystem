import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUser, AdminDashboardStats } from '../models/admin-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // Use API Gateway proxy to avoid CORS and keep service port decoupled
  private apiUrl = '/user/api/admin';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Lấy tất cả người dùng
   */
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Tạo người dùng mới
   */
  createUser(userData: any): Observable<AdminUser> {
    const payload = {
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      fullName: userData.fullName,
      role: userData.role,
      adminSecretKey: 'your-secret-key' // Thay bằng key thật từ config
    };

    return this.http.post<AdminUser>(`${this.apiUrl}/users`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Cập nhật người dùng (bao gồm role)
   */
  updateUser(userId: string, userData: any): Observable<AdminUser> {
    const payload = {
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      status: userData.status,
      password: userData.password || undefined // Chỉ gửi nếu có thay đổi
    };

    return this.http.put<AdminUser>(`${this.apiUrl}/users/${userId}`, payload, {
      headers: this.getHeaders()
    });
  }

  /**
   * Khóa tài khoản
   */
  lockUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/lock`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Mở khóa tài khoản
   */
  unlockUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/unlock`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Xóa tài khoản
   */
  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Lấy thống kê dashboard
   */
  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/dashboard`, {
      headers: this.getHeaders()
    });
  }
}