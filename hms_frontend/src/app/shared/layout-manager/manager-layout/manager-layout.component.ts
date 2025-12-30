import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ManagerHeaderComponent } from '../manager-header/manager-header.component';
import { ManagerSidebarComponent } from '../manager-sidebar/manager-sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [RouterOutlet, ManagerHeaderComponent, ManagerSidebarComponent, CommonModule],
  templateUrl: './manager-layout.component.html',
  styleUrl: './manager-layout.component.css',
})
export class ManagerLayoutComponent {
  isSidebarCollapsed = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
