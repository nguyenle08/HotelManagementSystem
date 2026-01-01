import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../models/reservation.model';

@Component({
  selector: 'app-staff-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-checkin.component.html',
  styleUrl: './staff-checkin.component.css',
})
export class StaffCheckinComponent implements OnInit {
  reservations = signal<Reservation[]>([]);
  filteredReservations = signal<Reservation[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  searchQuery = '';

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCheckInReservations();
  }

  loadCheckInReservations(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    // Load all reservations with CONFIRMED status (waiting for check-in)
    this.reservationService.getAllReservations().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filter only CONFIRMED status
          const confirmedReservations = response.data.filter(
            (r) => r.status === 'CONFIRMED'
          );
          this.reservations.set(confirmedReservations);
          this.applyFilters();
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Không thể tải danh sách');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    let filtered = this.reservations();

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.reservationCode.toLowerCase().includes(query) ||
          r.guestFullName?.toLowerCase().includes(query) ||
          r.roomTypeName.toLowerCase().includes(query)
      );
    }

    this.filteredReservations.set(filtered);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  viewReservation(reservationId: string): void {
    this.router.navigate(['/reservation-detail', reservationId]);
  }

  performCheckIn(reservation: Reservation): void {
    const guestName = reservation.guestFullName || 'khách';
    if (
      !confirm(
        `Xác nhận check-in cho ${guestName}?\nPhòng: ${reservation.roomTypeName}`
      )
    ) {
      return;
    }

    this.loading.set(true);
    this.reservationService
      .checkInReservation(reservation.reservationId)
      .subscribe({
        next: (response) => {
          alert('Check-in thành công!');
          this.loadCheckInReservations(); // Reload list
        },
        error: (error) => {
          alert(
            'Check-in thất bại: ' + (error.error?.message || error.message)
          );
          this.loading.set(false);
        },
      });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('vi-VN');
  }

  formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  isToday(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isPastDue(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  get todayCheckIns(): number {
    return this.filteredReservations().filter((r) =>
      this.isToday(r.checkInDate)
    ).length;
  }

  get pastDueCheckIns(): number {
    return this.filteredReservations().filter((r) =>
      this.isPastDue(r.checkInDate)
    ).length;
  }
}
