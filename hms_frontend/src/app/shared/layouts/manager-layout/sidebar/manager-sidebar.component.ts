import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav class="nav">
        <a routerLink="/manager" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
          <span>📊 Dashboard</span>
        </a>
        <a routerLink="/manager/room-types" routerLinkActive="active" class="nav-link">
          <span>🏠 Room Types</span>
        </a>
        <a routerLink="/manager/rooms" routerLinkActive="active" class="nav-link">
          <span>🔑 Rooms</span>
        </a>
        <a routerLink="/manager/reports" routerLinkActive="active" class="nav-link">
          <span>📈 Reports</span>
        </a>
        <a routerLink="/manager/staff" routerLinkActive="active" class="nav-link">
          <span>👥 Staff</span>
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
      background-color: rgba(124, 58, 237, 0.1);
      border-left-color: #8b5cf6;
      color: white;
    }

    .nav-link span {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `]
})
export class ManagerSidebarComponent {}
