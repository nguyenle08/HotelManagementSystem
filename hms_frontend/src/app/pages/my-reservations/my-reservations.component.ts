import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/reservation.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.css'],
})
export class MyReservationsComponent implements OnInit {
  reservations = signal<Reservation[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading.set(true);
    this.reservationService.getMyReservations().subscribe({
      next: (response) => {
        if (response.success) {
          this.reservations.set(response.data);
        } else {
          this.errorMessage.set(
            response.message || 'Không thể tải danh sách đặt phòng'
          );
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Đã xảy ra lỗi khi tải danh sách đặt phòng');
        this.loading.set(false);
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  canCancel(reservation: Reservation): boolean {
    // Can only cancel if status is PENDING or CONFIRMED
    if (
      reservation.status === 'CANCELLED' ||
      reservation.status === 'CHECKED_IN' ||
      reservation.status === 'CHECKED_OUT' ||
      reservation.status === 'NO_SHOW'
    ) {
      return false;
    }
    return true;
  }

  canPayNow(reservation: Reservation): boolean {
    // Chỉ hiển thị nút thanh toán nếu trạng thái là PENDING
    return reservation.status === 'PENDING';
  }

  cancelReservation(reservation: Reservation): void {
    if (!confirm(`Bạn có chắc chắn muốn hủy đặt phòng ${reservation.roomTypeName}?`)) {
      return;
    }

    this.loading.set(true);
    this.reservationService.cancelReservation(reservation.reservationId).subscribe({
      next: (response) => {
        if (response.success) {
          // Refresh list
          this.loadReservations();
          alert('Hủy đặt phòng thành công!');
        } else {
          alert(response.message || 'Không thể hủy đặt phòng');
        }
        this.loading.set(false);
      },
      error: (error) => {
        const errorMsg = error.error?.message || 'Đã xảy ra lỗi khi hủy đặt phòng';
        alert(errorMsg);
        this.loading.set(false);
      }
    });
  }

  payNow(reservation: Reservation): void {
    // Điều hướng đến trang thanh toán hoặc mở modal thanh toán
    alert('Chức năng thanh toán đang được phát triển. Mã đặt phòng: ' + reservation.reservationCode);
  }

  formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }
}
