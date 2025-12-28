import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>Staff Dashboard</h1>
      <p>Welcome to the Staff Panel</p>
      <div class="cards">
        <div class="card">
          <h3>Check-ins Today</h3>
          <p class="number">12</p>
        </div>
        <div class="card">
          <h3>Check-outs Today</h3>
          <p class="number">8</p>
        </div>
        <div class="card">
          <h3>Pending Requests</h3>
          <p class="number">5</p>
        </div>
        <div class="card">
          <h3>Occupied Rooms</h3>
          <p class="number">34</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
    }

    h1 {
      margin-bottom: 2rem;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .card h3 {
      margin: 0 0 1rem 0;
      color: #6b7280;
    }

    .number {
      font-size: 2rem;
      font-weight: bold;
      color: #059669;
      margin: 0;
    }
  `]
})
export class StaffDashboardComponent {}
