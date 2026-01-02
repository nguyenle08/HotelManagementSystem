import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CreateReservationRequest,
  Reservation,
  ApiResponse,
} from '../models/reservation.model';
import {
  TodayAction,
  RoomSnapshot,
  AlertItem,
  DashboardSummary,
  DashboardResponse,
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUrl = '/reservation/api/reservations';

  reservations = signal<Reservation[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

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

  // Staff/Admin: Get all reservations in the system
  getAllReservations(): Observable<ApiResponse<Reservation[]>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<ApiResponse<Reservation[]>>(`${this.apiUrl}/all`).pipe(
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

  cancelReservation(reservationId: string): Observable<ApiResponse<any>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .delete<ApiResponse<any>>(`${this.apiUrl}/${reservationId}/cancel`)
      .pipe(
        tap({
          next: () => this.loading.set(false),
          error: (err) => {
            this.loading.set(false);
            this.error.set(
              err.error?.message || 'Có lỗi xảy ra khi hủy đặt phòng'
            );
          },
        })
      );
  }

  checkInReservation(
    reservationId: string
  ): Observable<ApiResponse<Reservation>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .put<ApiResponse<Reservation>>(
        `${this.apiUrl}/${reservationId}/check-in`,
        {}
      )
      .pipe(
        tap({
          next: () => this.loading.set(false),
          error: (err) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Có lỗi xảy ra khi check-in');
          },
        })
      );
  }

  checkOutReservation(
    reservationId: string
  ): Observable<ApiResponse<Reservation>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .put<ApiResponse<Reservation>>(
        `${this.apiUrl}/${reservationId}/check-out`,
        {}
      )
      .pipe(
        tap({
          next: () => this.loading.set(false),
          error: (err) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Có lỗi xảy ra khi check-out');
          },
        })
      );
  }

  updateReservation(
    reservationId: string,
    data: any
  ): Observable<ApiResponse<Reservation>> {
    this.loading.set(true);
    this.error.set(null);

    return this.http
      .put<ApiResponse<Reservation>>(`${this.apiUrl}/${reservationId}`, data)
      .pipe(
        tap({
          next: () => this.loading.set(false),
          error: (err) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Có lỗi xảy ra khi cập nhật');
          },
        })
      );
  }
  getDashboardData(): Observable<ApiResponse<DashboardResponse>> {
    this.loading.set(true);
    this.error.set(null);

    // Đổi kiểu trả về thành ApiResponse để bọc dữ liệu chuẩn
    return this.http
      .get<ApiResponse<DashboardResponse>>(`${this.apiUrl}/dashboard`)
      .pipe(
        tap({
          next: (response) => {
            // Kiểm tra nếu có data từ ApiResponse
            const res = response.data;

            if (res) {
              // map typeLabel cho todayActions
              const mappedActions = (res.todayActions || []).map((a) => ({
                ...a,
                typeLabel:
                  a.type === 'CHECKIN'
                    ? 'Check-in'
                    : a.type === 'CHECKOUT'
                    ? 'Check-out'
                    : 'Quá hạn',
              }));

              // Cập nhật các signals trong service
              this.todayActions.set(mappedActions);

              this.roomSnapshot.set({
                available: res.roomSnapshot?.available ?? 0,
                occupied: res.roomSnapshot?.occupied ?? 0,
                cleaning: res.roomSnapshot?.cleaning ?? 0,
                attention: res.roomSnapshot?.attention ?? 0,
                cleaningOverdue: res.roomSnapshot?.cleaningOverdue ?? 0,
              });

              this.alerts.set(res.alerts || []);

              this.summary.set({
                checkInToday: res.summary?.checkInToday ?? 0,
                checkOutToday: res.summary?.checkOutToday ?? 0,
                overdue: res.summary?.overdue ?? 0,
              });
            }

            this.loading.set(false);
          },
          error: (err) => {
            this.loading.set(false);
            this.error.set(err.error?.message || 'Không tải được dashboard');
          },
        })
      );
  }
}
