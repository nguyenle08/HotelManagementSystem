import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StaffHeaderComponent } from './header/staff-header.component';
import { StaffSidebarComponent } from './sidebar/staff-sidebar.component';

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [RouterOutlet, StaffHeaderComponent, StaffSidebarComponent],
  template: `
    <div class="staff-layout">
      <app-staff-header></app-staff-header>
      <div class="layout-container">
        <app-staff-sidebar></app-staff-sidebar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .staff-layout {
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
export class StaffLayoutComponent {}
