import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ManagerHeaderComponent } from './header/manager-header.component';
import { ManagerSidebarComponent } from './sidebar/manager-sidebar.component';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [RouterOutlet, ManagerHeaderComponent, ManagerSidebarComponent],
  template: `
    <div class="manager-layout">
      <app-manager-header></app-manager-header>
      <div class="layout-container">
        <app-manager-sidebar></app-manager-sidebar>
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .manager-layout {
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
export class ManagerLayoutComponent {}
