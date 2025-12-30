import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-staff-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './staff-sidebar.component.html',
  styleUrl: './staff-sidebar.component.css'
})
export class StaffSidebarComponent {
  @Input() isCollapsed = false;
}
