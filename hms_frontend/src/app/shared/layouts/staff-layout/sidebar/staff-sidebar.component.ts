import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-staff-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav class="nav">
        <a routerLink="/staff" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
          <span>📊 Dashboard</span>
        </a>
        <a routerLink="/staff/reservations" routerLinkActive="active" class="nav-link">
          <span>📅 Reservations</span>
        </a>
        <a routerLink="/staff/check-in" routerLinkActive="active" class="nav-link">
          <span>✅ Check-in</span>
        </a>
        <a routerLink="/staff/check-out" routerLinkActive="active" class="nav-link">
          <span>🚪 Check-out</span>
        </a>
        <a routerLink="/staff/requests" routerLinkActive="active" class="nav-link">
          <span>🔔 Requests</span>
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
      background-color: rgba(5, 150, 105, 0.1);
      border-left-color: #10b981;
      color: white;
    }

    .nav-link span {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class StaffSidebarComponent {}
