import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ReservationDetail } from '../models/reservation-detail.model';
import { ApiResponse } from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationDetailService {
  private apiUrl = 'http://localhost:8080/reservation/api/reservations';

  detail = signal<ReservationDetail | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  load(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<ApiResponse<ReservationDetail>>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data))
      .subscribe({
        next: (detail) => {
          this.detail.set(detail);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || 'Không tải được chi tiết đặt phòng'
          );
          this.loading.set(false);
        },
      });
  }

  clear(): void {
    this.detail.set(null);
    this.error.set(null);
    this.loading.set(false);
  }

  cancelReservation(reservationId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${reservationId}/cancel`);
  }
}
