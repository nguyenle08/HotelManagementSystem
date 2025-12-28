import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav class="nav">
        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
          <span>📊 Dashboard</span>
        </a>
        <a routerLink="/admin/users" routerLinkActive="active" class="nav-link">
          <span>👥 Users</span>
        </a>
        <a routerLink="/admin/rooms" routerLinkActive="active" class="nav-link">
          <span>🏠 Rooms</span>
        </a>
        <a routerLink="/admin/reservations" routerLinkActive="active" class="nav-link">
          <span>📅 Reservations</span>
        </a>
        <a routerLink="/admin/settings" routerLinkActive="active" class="nav-link">
          <span>⚙️ Settings</span>
        </a>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      background: #1f2937;
      color: white;
      padding: 1rem 0;
    }

    .nav {
      display: flex;
      flex-direction: column;
    }

    .nav-link {
      color: #9ca3af;
      text-decoration: none;
      padding: 1rem 1.5rem;
      transition: all 0.3s;
      border-left: 3px solid transparent;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: white;
    }

    .nav-link.active {
      background-color: rgba(59, 130, 246, 0.1);
      border-left-color: #3b82f6;
      color: white;
    }

    .nav-link span {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class AdminSidebarComponent {}
