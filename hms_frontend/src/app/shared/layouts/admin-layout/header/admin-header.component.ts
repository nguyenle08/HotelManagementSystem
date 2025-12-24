import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <h2>Admin Panel</h2>
        <div class="user-info">
          <span>{{ username() }}</span>
          <button (click)="logout()" class="btn-logout">Đăng xuất</button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: #1e40af;
      color: white;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h2 {
      margin: 0;
    }

    .user-info {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .btn-logout {
      background-color: #ef4444;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-logout:hover {
      background-color: #dc2626;
    }
  `]
})
export class AdminHeaderComponent {
  username = signal('');

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {
    const user = this.tokenService.getUser();
    if (user) {
      this.username.set(user.username);
    }
  }

  logout(): void {
    this.tokenService.clearTokens();
    this.router.navigate(['/login']);
  }
}
