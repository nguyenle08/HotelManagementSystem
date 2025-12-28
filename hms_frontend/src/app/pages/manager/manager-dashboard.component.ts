import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h1>Manager Dashboard</h1>
      <p>Welcome to the Manager Panel</p>
      <div class="cards">
        <div class="card">
          <h3>Room Types</h3>
          <p class="number">8</p>
        </div>
        <div class="card">
          <h3>Total Rooms</h3>
          <p class="number">45</p>
        </div>
        <div class="card">
          <h3>Staff Members</h3>
          <p class="number">15</p>
        </div>
        <div class="card">
          <h3>Monthly Revenue</h3>
          <p class="number">$85,000</p>
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
      color: #7c3aed;
      margin: 0;
    }
  `]
})
export class ManagerDashboardComponent {}
