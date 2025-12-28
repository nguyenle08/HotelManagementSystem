import { Component, inject, OnInit, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReservationDetailService } from '../../services/reservation-detail.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-detail.component.html',
  styleUrls: ['./reservation-detail.component.css'],
})
export class ReservationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly service = inject(ReservationDetailService);
  private location = inject(Location);

  readonly detail = this.service.detail;
  readonly loading = this.service.loading;
  readonly error = this.service.error;

  readonly totalNights = computed(() => {
    const d = this.detail();
    if (!d || !d.checkInDate || !d.checkOutDate) return 0;

    const checkIn = new Date(d.checkInDate);
    const checkOut = new Date(d.checkOutDate);

    const diffMs = checkOut.getTime() - checkIn.getTime();
    const nights = diffMs / (1000 * 60 * 60 * 24);

    return Math.max(Math.round(nights), 1);
  });

  readonly taxes = computed(() => {
    const d = this.detail();
    if (!d) return 0;

    const subtotal = d.pricePerNight * this.totalNights();
    return Math.round(subtotal * 0.1 * 100) / 100; // 2 chữ số thập phân
  });

  readonly canCancel = computed(() => {
    const d = this.detail();
    if (!d) return false;

    return d.status === 'PENDING' && d.paymentStatus === 'PENDING';
  });

  ngOnInit(): void {
    const reservationId = this.route.snapshot.paramMap.get('id');
    if (reservationId) {
      this.service.load(reservationId);
    }
  }

  goBack() {
    this.location.back();
  }

  cancelBooking() {
    if (!this.canCancel()) return;

    const d = this.detail();
    if (!d) return;

    this.service.cancelReservation(d.reservationId).subscribe({
      next: () => {
        alert('Booking cancelled successfully!');
        d.status = 'CANCELLED';
      },
      error: (err) => {
        console.error(err);
        alert('Failed to cancel booking.');
      },
    });
  }
}
