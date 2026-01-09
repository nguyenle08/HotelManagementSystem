import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ReservationService } from '../../../services/reservation.service';
import { RoomService } from '../../../services/room.service';
import {
  TodayAction,
  RoomSnapshot,
  AlertItem,
  DashboardSummary,
  DashboardResponse,
} from '../../../models/dashboard.model';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './staff-dashboard.component.html',
  styleUrls: ['./staff-dashboard.component.css'],
})
export class StaffDashboardComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private roomService = inject(RoomService);

  loading = signal(false);
  error = signal<string | null>(null);
  today = new Date();

  todayActions = signal<TodayAction[]>([]);
  roomSnapshot = signal<RoomSnapshot>({
    available: 0,
    occupied: 0,
    cleaning: 0,
    attention: 0,
    cleaningOverdue: 0,
  });
  alerts = signal<AlertItem[]>([]);
  summary = signal<DashboardSummary>({
    checkInToday: 0,
    checkOutToday: 0,
    overdue: 0,
  });

  ngOnInit(): void {
    this.loadDashboard();
  }


  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      dashboard: this.reservationService.getDashboardData(),
      rooms: this.roomService.getRoomStatuses(),
    }).subscribe({
      next: (res: any) => {
        const dashData: DashboardResponse = res.dashboard.data
          ? res.dashboard.data
          : res.dashboard;

        if (dashData) {
          this.todayActions.set(dashData.todayActions || []);
          this.alerts.set(dashData.alerts || []);
          this.summary.set({
            checkInToday: dashData.summary?.checkInToday || 0,
            checkOutToday: dashData.summary?.checkOutToday || 0,
            overdue: dashData.summary?.overdue || 0,
          });
        }

        // If reservation dashboard already provided a roomSnapshot, prefer it
        // Otherwise derive a snapshot from the raw room statuses
        if (res.rooms?.data && !(dashData && dashData.roomSnapshot)) {
          const roomsArray = res.rooms.data as any[];
          this.roomSnapshot.set({
            available: roomsArray.filter(
              (r) => r.status === 'ACTIVE'
            ).length,
            occupied: roomsArray.filter(
              (r) => r.status === 'OCCUPIED' || r.status === 'RESERVED'
            ).length,
            cleaning: roomsArray.filter(
              (r) => r.status === 'DECOMMISSIONED'
            ).length,
            attention: roomsArray.filter((r) => r.status === 'MAINTENANCE')
              .length,
            cleaningOverdue: 0,
          });
        } else if (dashData && dashData.roomSnapshot) {
          // Use the snapshot from backend if available
          this.roomSnapshot.set(dashData.roomSnapshot);
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Không thể tải dữ liệu Dashboard');
        this.loading.set(false);
      },
    });
  }

  isOverdue(action: TodayAction): boolean {
    return action.type === 'OVERDUE';
  }
  formatTime(time?: string): string {
    if (!time) return '—';
    if (time.length === 10) return time;

    try {
      const date = new Date(time);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return time;
    }
  }
  get cleaningOverdueCount(): number {
    return this.roomSnapshot().cleaningOverdue ?? 0;
  }

  get overdueCount(): number {
    return this.summary().overdue ?? 0;
  }
}
