import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../services/reservation.service';
import { RoomService } from '../../../services/room.service';
import { Reservation } from '../../../models/reservation.model';
import { RoomStatus } from '../../../models/room-status.model';

@Component({
  selector: 'app-manager-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-report.component.html',
  styleUrl: './manager-report.component.css'
})
export class ManagerReportComponent implements OnInit {
  // Raw data
  allReservations: Reservation[] = [];
  rooms: RoomStatus[] = [];

  // Time range filter
  range: '7' | '30' | '90' | '365' = '7';
  filteredReservations: Reservation[] = [];

  // Summary metrics
  totalBookings = 0;
  totalRevenue = 0;
  occupancyRate = 0; // 0..1
  averageRating = 4.8; // placeholder

  // Per room-type stats
  roomTypeStats: Array<{
    roomTypeId: string;
    roomTypeName: string;
    bookings: number;
    revenue: number;
    occupancyRate: number; // 0..1
    performance: string;
  }> = [];

  // Monthly stats
  bookingsPerMonth: number[] = Array(12).fill(0);
  revenuePerMonth: number[] = Array(12).fill(0);
  maxBookings = 1;
  maxRevenue = 1;

  isLoading = false;
  errorMessage = '';

  constructor(
    private reservationService: ReservationService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load rooms
    this.roomService.getRoomStatuses().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rooms = res.data;
        }
      },
      error: () => {},
    });

    // Load reservations
    this.reservationService.getAllReservations().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.allReservations = res.data;
          this.computeMonthlyStats();
          this.applyRange();
        } else {
          this.errorMessage = res.message || 'Không thể tải dữ liệu báo cáo';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading reservations for report:', err);
        this.errorMessage = 'Không thể tải dữ liệu báo cáo';
        this.isLoading = false;
      },
    });
  }

  onRangeChange(): void {
    this.applyRange();
  }

  private applyRange(): void {
    if (!this.allReservations.length) {
      this.filteredReservations = [];
      this.totalBookings = 0;
      this.totalRevenue = 0;
      this.occupancyRate = 0;
      this.roomTypeStats = [];
      return;
    }

    const days = parseInt(this.range, 10);
    const now = new Date();
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    this.filteredReservations = this.allReservations.filter((r) => {
      const created = new Date(r.createdAt);
      return created >= start && created <= now;
    });

    this.computeSummary(start, now);
    this.computeRoomTypeStats(start, now);
  }

  private computeSummary(start: Date, end: Date): void {
    const validStatuses: Reservation['status'][] = [
      'CONFIRMED',
      'CHECKED_IN',
      'CHECKED_OUT',
    ];

    const valid = this.filteredReservations.filter((r) =>
      validStatuses.includes(r.status)
    );

    this.totalBookings = valid.length;
    this.totalRevenue = valid.reduce(
      (sum, r) => sum + (r.totalAmount || 0),
      0
    );

    const nightsBooked = valid.reduce((sum, r) => {
      const checkIn = new Date(r.checkInDate);
      const checkOut = new Date(r.checkOutDate);
      const diff =
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
      const nights = Math.max(1, Math.round(diff));
      return sum + nights;
    }, 0);

    const activeRooms = this.rooms.filter((r) => r.status === 'ACTIVE').length;
    const daysInRange = Math.max(
      1,
      Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    if (activeRooms > 0) {
      this.occupancyRate = Math.min(
        1,
        nightsBooked / (activeRooms * daysInRange)
      );
    } else {
      this.occupancyRate = 0;
    }
  }

  private computeRoomTypeStats(start: Date, end: Date): void {
    const daysInRange = Math.max(
      1,
      Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    const validStatuses: Reservation['status'][] = [
      'CONFIRMED',
      'CHECKED_IN',
      'CHECKED_OUT',
    ];

    const byType = new Map<
      string,
      {
        name: string;
        bookings: number;
        revenue: number;
        nights: number;
        rooms: number;
      }
    >();

    const activeRoomCounts = new Map<string, number>();
    this.rooms
      .filter((r) => r.status === 'ACTIVE')
      .forEach((r) => {
        activeRoomCounts.set(
          r.roomTypeId,
          (activeRoomCounts.get(r.roomTypeId) || 0) + 1
        );
      });

    this.filteredReservations
      .filter((r) => validStatuses.includes(r.status))
      .forEach((r) => {
        const key = r.roomTypeId;
        const stat =
          byType.get(key) ||
          ({
            name: r.roomTypeName,
            bookings: 0,
            revenue: 0,
            nights: 0,
            rooms: activeRoomCounts.get(key) || 0,
          } as const as any);

        const checkIn = new Date(r.checkInDate);
        const checkOut = new Date(r.checkOutDate);
        const diff =
          (checkOut.getTime() - checkIn.getTime()) /
          (1000 * 60 * 60 * 24);
        const nights = Math.max(1, Math.round(diff));

        stat.bookings += 1;
        stat.revenue += r.totalAmount || 0;
        stat.nights += nights;
        byType.set(key, stat);
      });

    this.roomTypeStats = Array.from(byType.entries()).map(([id, s]) => {
      const capacity = s.rooms * daysInRange || 1;
      const occ = Math.min(1, s.nights / capacity);
      let performance = 'Trung bình';
      if (occ >= 0.85) performance = 'Xuất sắc';
      else if (occ >= 0.7) performance = 'Tốt';

      return {
        roomTypeId: id,
        roomTypeName: s.name,
        bookings: s.bookings,
        revenue: s.revenue,
        occupancyRate: occ,
        performance,
      };
    });

    // Sắp xếp theo doanh thu giảm dần
    this.roomTypeStats.sort((a, b) => b.revenue - a.revenue);
  }

  private computeMonthlyStats(): void {
    this.bookingsPerMonth = Array(12).fill(0);
    this.revenuePerMonth = Array(12).fill(0);

    const validStatuses: Reservation['status'][] = [
      'CONFIRMED',
      'CHECKED_IN',
      'CHECKED_OUT',
    ];

    this.allReservations
      .filter((r) => validStatuses.includes(r.status))
      .forEach((r) => {
        const date = new Date(r.checkInDate || r.createdAt);
        const month = date.getMonth(); // 0-11
        this.bookingsPerMonth[month] += 1;
        this.revenuePerMonth[month] += r.totalAmount || 0;
      });

    this.maxBookings = Math.max(...this.bookingsPerMonth, 1);
    this.maxRevenue = Math.max(...this.revenuePerMonth, 1);
  }

  formatCurrency(amount: number): string {
    return (amount || 0).toLocaleString('vi-VN') + 'đ';
  }

  formatPercent(rate: number): string {
    const value = Math.round((rate || 0) * 100);
    return value + '%';
  }
}