import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RegisterRequest, LoginRequest } from '../models/user.model';
import { AuthResponse, ApiResponse } from '../models/auth-response.model';
import { TokenService } from '../core/services/token.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth/api/auth';
  currentUser = signal<AuthResponse | null>(null);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {
    const user = this.tokenService.getUser();
    if (user) {
      this.currentUser.set(user);
    }
  }

  register(data: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setCurrentUser(response.data);
        }
      })
    );
  }

  login(data: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.setCurrentUser(response.data);
          this.redirectByRole(response.data.role);
        }
      })
    );
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private setCurrentUser(user: AuthResponse): void {
    this.tokenService.saveUser(user);
    this.currentUser.set(user);
  }

  private redirectByRole(role: string): void {
    // Luôn redirect về trang chủ sau khi login, bất kể role
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated();
  }
}