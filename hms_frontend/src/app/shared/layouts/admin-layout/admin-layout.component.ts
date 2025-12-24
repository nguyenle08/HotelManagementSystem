import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminHeaderComponent } from './header/admin-header.component';
import { AdminSidebarComponent } from './sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminHeaderComponent, AdminSidebarComponent],
  template: `
    <div class="admin-layout">
      <app-admin-header></app-admin-header>
      <div class="layout-container">
        <app-admin-sidebar></app-admin-sidebar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .layout-container {
      display: flex;
      flex: 1;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      background-color: #f3f4f6;
    }
  `]
})
export class AdminLayoutComponent {}
