import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomService } from '../../../services/room.service';
import { ReservationService } from '../../../services/reservation.service';
import { RoomStatus } from '../../../models/room-status.model';
import { Reservation } from '../../../models/reservation.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent implements OnInit {
  rooms: RoomStatus[] = [];
  reservations: Reservation[] = [];

  isLoading = false;
  errorMessage = '';

  // Placeholder trend values for UI
  totalRoomsTrend = '+12%';
  freeRoomsTrend = '+8%';
  usingRoomsTrend = '-5%';
  maintenanceTrend = '0%';

  constructor(
    private roomService: RoomService,
    private reservationService: ReservationService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.roomService.getRoomStatuses().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rooms = res.data;
        } else {
          this.errorMessage =
            this.errorMessage || res.message || 'Không thể tải dữ liệu phòng';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading room statuses:', err);
        this.errorMessage = 'Không thể tải dữ liệu phòng';
        this.isLoading = false;
      },
    });

    this.reservationService.getAllReservations().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.reservations = res.data;
        } else {
          this.errorMessage =
            this.errorMessage || res.message || 'Không thể tải dữ liệu đặt phòng';
        }
      },
      error: (err) => {
        console.error('Error loading reservations for dashboard:', err);
        this.errorMessage =
          this.errorMessage || 'Không thể tải dữ liệu đặt phòng';
      },
    });
  }

  get totalRooms(): number {
    return this.rooms.length;
  }

  get maintenanceRooms(): number {
    return this.rooms.filter((r) => r.status === 'MAINTENANCE').length;
  }

  get activeRooms(): number {
    return this.rooms.filter((r) => r.status === 'ACTIVE').length;
  }

  get usingRooms(): number {
    // Count rooms with OCCUPIED or RESERVED status
    return this.rooms.filter((r) => r.status === 'OCCUPIED' || r.status === 'RESERVED').length;
  }

  get freeRooms(): number {
    // Count rooms that are ACTIVE (not occupied, not reserved, not maintenance, not decommissioned)
    return this.rooms.filter((r) => r.status === 'ACTIVE').length;
  }


  get recentReservations(): Reservation[] {
    if (!this.reservations?.length) {
      return [];
    }

    return [...this.reservations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }
}
