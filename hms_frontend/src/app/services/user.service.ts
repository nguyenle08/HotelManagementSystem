import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {

  private apiUrl = 'http://localhost:8080/user/api/users';

  constructor(private http: HttpClient) {}

  getMyProfile() {
    return this.http.get(`${this.apiUrl}/me`);
  }

  updateProfile(userId: string, data: any) {
    return this.http.put(`${this.apiUrl}/${userId}`, data);
  }
}
