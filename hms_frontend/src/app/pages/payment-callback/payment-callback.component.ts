import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-callback">
      <div *ngIf="loading" class="loading">
        <i class="fa fa-spinner fa-spin"></i>
        <h2>Đang xử lý thanh toán...</h2>
      </div>

      <div *ngIf="!loading && success" class="success">
        <i class="fa fa-check-circle"></i>
        <h2>Thanh toán thành công!</h2>
        <p>{{ message }}</p>
        <button (click)="goToReservation()">Xem chi tiết đặt phòng</button>
      </div>

      <div *ngIf="!loading && !success" class="error">
        <i class="fa fa-times-circle"></i>
        <h2>Thanh toán thất bại</h2>
        <p>{{ message }}</p>
        <button (click)="goToReservation()">Quay lại đặt phòng</button>
      </div>
    </div>
  `,
  styles: [`
    .payment-callback {
      max-width: 500px;
      margin: 100px auto;
      text-align: center;
      padding: 40px;
    }

    .loading i {
      font-size: 48px;
      color: #14b8a6;
      margin-bottom: 20px;
    }

    .success i {
      font-size: 64px;
      color: #10b981;
      margin-bottom: 20px;
    }

    .error i {
      font-size: 64px;
      color: #ef4444;
      margin-bottom: 20px;
    }

    h2 {
      margin-bottom: 16px;
      color: #333;
    }

    p {
      color: #666;
      margin-bottom: 24px;
    }

    button {
      background: #14b8a6;
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s;
    }

    button:hover {
      background: #0d9488;
    }
  `]
})
export class PaymentCallbackComponent implements OnInit {
  loading = true;
  success = false;
  message = '';
  reservationId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.reservationId = params['reservationId'] || '';
      
      // Verify payment with VNPay callback params
      this.paymentService.verifyPayment(params).subscribe({
        next: (response) => {
          this.loading = false;
          this.success = response.success;
          this.message = response.message || (response.success ? 'Thanh toán thành công' : 'Thanh toán thất bại');
        },
        error: (err) => {
          this.loading = false;
          this.success = false;
          this.message = err?.error?.message || 'Có lỗi xảy ra khi xử lý thanh toán';
        }
      });
    });
  }

  goToReservation(): void {
    if (this.reservationId) {
      this.router.navigate(['/reservation-detail', this.reservationId]);
    } else {
      this.router.navigate(['/my-reservations']);
    }
  }
}
