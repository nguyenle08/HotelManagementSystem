import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../models/reservation.model';

@Component({
  selector: 'app-staff-reservation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-reservation-list.component.html',
  styleUrl: './staff-reservation-list.component.css',
})
export class StaffReservationListComponent implements OnInit {
  reservations = signal<Reservation[]>([]);
  filteredReservations = signal<Reservation[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  searchQuery = '';
  selectedFilter: 'ALL' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' = 'ALL';

  // Modal states
  showDetailModal = signal(false);
  showEditModal = signal(false);
  showCheckInModal = signal(false);
  showCheckOutModal = signal(false);
  selectedReservation = signal<Reservation | null>(null);

  // Edit form
  editForm: any = {
    guestFullName: '',
    guestPhoneNumber: '',
    guestEmail: '',
    checkInDate: '',
    checkOutDate: '',
    numAdults: 1,
    numChildren: 0,
    specialRequests: '',
    staffNotes: '',
  };

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    // Call staff API to get ALL reservations from all users
    this.reservationService.getAllReservations().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.reservations.set(response.data);
          this.applyFilters();
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Không thể tải danh sách đặt phòng');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    let filtered = this.reservations();

    // Filter by status
    if (this.selectedFilter !== 'ALL') {
      filtered = filtered.filter((r) => r.status === this.selectedFilter);
    }

    // Search
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

  onFilterChange(
    filter: 'ALL' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED'
  ): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  viewReservation(reservationId: string): void {
    this.router.navigate(['/reservations', reservationId]);
  }

  viewDetail(reservation: Reservation): void {
    this.selectedReservation.set(reservation);
    this.showDetailModal.set(true);
  }

  editReservation(reservation: Reservation): void {
    this.selectedReservation.set(reservation);
    // Populate edit form with current data
    this.editForm = {
      guestFullName: reservation.guestFullName || '',
      guestPhoneNumber: reservation.guestPhoneNumber || '',
      guestEmail: reservation.guestEmail || '',
      checkInDate: reservation.checkInDate.split('T')[0],
      checkOutDate: reservation.checkOutDate.split('T')[0],
      numAdults: reservation.numAdults,
      numChildren: reservation.numChildren,
      specialRequests: reservation.specialRequests || '',
      staffNotes: reservation.staffNotes || '',
    };
    this.showEditModal.set(true);
  }

  deleteReservation(reservation: Reservation): void {
    const guestName = reservation.guestFullName || 'khách';
    if (
      !confirm(
        `Bạn có chắc muốn xóa đặt phòng ${reservation.reservationCode} của ${guestName}?`
      )
    ) {
      return;
    }

    this.loading.set(true);
    this.reservationService
      .cancelReservation(reservation.reservationId)
      .subscribe({
        next: (response) => {
          alert('Xóa đặt phòng thành công!');
          this.loadReservations();
        },
        error: (error) => {
          alert('Xóa thất bại: ' + (error.error?.message || error.message));
          this.loading.set(false);
        },
      });
  }

  openCheckInModal(reservation: Reservation): void {
    this.selectedReservation.set(reservation);
    this.showCheckInModal.set(true);
  }

  openCheckOutModal(reservation: Reservation): void {
    this.selectedReservation.set(reservation);
    this.showCheckOutModal.set(true);
  }

  closeModals(): void {
    this.showDetailModal.set(false);
    this.showEditModal.set(false);
    this.showCheckInModal.set(false);
    this.showCheckOutModal.set(false);
    this.selectedReservation.set(null);
  }

  confirmCheckIn(): void {
    const reservation = this.selectedReservation();
    if (!reservation) return;

    this.loading.set(true);
    this.reservationService
      .checkInReservation(reservation.reservationId)
      .subscribe({
        next: (response) => {
          alert(
            `Check-in thành công cho ${reservation.guestFullName || 'khách'}!`
          );
          this.closeModals();
          this.loadReservations();
        },
        error: (error) => {
          alert(
            'Check-in thất bại: ' + (error.error?.message || error.message)
          );
          this.loading.set(false);
        },
      });
  }

  confirmCheckOut(): void {
    const reservation = this.selectedReservation();
    if (!reservation) return;

    this.loading.set(true);
    this.reservationService
      .checkOutReservation(reservation.reservationId)
      .subscribe({
        next: (response) => {
          alert(
            `Check-out thành công cho ${reservation.guestFullName || 'khách'}!`
          );
          this.closeModals();
          this.loadReservations();
        },
        error: (error) => {
          alert(
            'Check-out thất bại: ' + (error.error?.message || error.message)
          );
          this.loading.set(false);
        },
      });
  }

  saveEdit(): void {
    const reservation = this.selectedReservation();
    if (!reservation) return;

    // Validate dates
    const checkIn = new Date(this.editForm.checkInDate);
    const checkOut = new Date(this.editForm.checkOutDate);

    if (checkOut <= checkIn) {
      alert('Ngày check-out phải sau ngày check-in!');
      return;
    }

    if (this.editForm.numAdults < 1) {
      alert('Phải có ít nhất 1 người lớn!');
      return;
    }

    this.loading.set(true);
    this.reservationService
      .updateReservation(reservation.reservationId, this.editForm)
      .subscribe({
        next: (response) => {
          alert('Cập nhật thành công!');
          this.closeModals();
          this.loadReservations();
        },
        error: (error) => {
          alert(
            'Cập nhật thất bại: ' + (error.error?.message || error.message)
          );
          this.loading.set(false);
        },
      });
  }

  checkIn(reservation: Reservation): void {
    if (reservation.status !== 'CONFIRMED') {
      alert('Chỉ có thể check-in cho booking đã xác nhận');
      return;
    }

    if (
      confirm(`Xác nhận check-in cho ${reservation.guestFullName || 'khách'}?`)
    ) {
      // TODO: Call check-in API
      console.log('Check-in:', reservation.reservationId);
      alert('Check-in thành công! (Chức năng đang phát triển)');
    }
  }

  checkOut(reservation: Reservation): void {
    if (reservation.status !== 'CHECKED_IN') {
      alert('Chỉ có thể check-out cho khách đang ở');
      return;
    }

    if (
      confirm(`Xác nhận check-out cho ${reservation.guestFullName || 'khách'}?`)
    ) {
      // TODO: Call check-out API
      console.log('Check-out:', reservation.reservationId);
      alert('Check-out thành công! (Chức năng đang phát triển)');
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'CHECKED_IN':
        return 'Đã nhận phòng';
      case 'CHECKED_OUT':
        return 'Đã trả phòng';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'NO_SHOW':
        return 'Không đến';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'CHECKED_IN':
        return 'status-checked-in';
      case 'CHECKED_OUT':
        return 'status-checked-out';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'NO_SHOW':
        return 'status-no-show';
      default:
        return '';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }

  formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
}
