import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CreateReservationRequest,
  Reservation,
  ApiResponse,
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = 'http://localhost:8080/reservation/api/reservations';

  reservations = signal<Reservation[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  createReservation(
    request: CreateReservationRequest
  ): Observable<ApiResponse<Reservation>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<ApiResponse<Reservation>>(this.apiUrl, request).pipe(
      tap({
        next: () => this.loading.set(false),
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Có lỗi xảy ra khi đặt phòng');
        },
      })
    );
  }

  getMyReservations(): Observable<ApiResponse<Reservation[]>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .get<ApiResponse<Reservation[]>>(`${this.apiUrl}/my-reservations`)
      .pipe(
        tap({
          next: (response) => {
            if (response.success) {
              this.reservations.set(response.data);
            }
            this.loading.set(false);
          },
          error: (err) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Có lỗi xảy ra');
          },
        })
      );
  }
}
