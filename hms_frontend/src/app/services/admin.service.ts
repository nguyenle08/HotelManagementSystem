import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminDashboardStats, AdminUser } from '../models/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = '/user/api/admin';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  updateUser(user: AdminUser): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${user.userId}`, user);
  }

  lockUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/lock`, {});
  }

  unlockUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/unlock`, {});
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }
}