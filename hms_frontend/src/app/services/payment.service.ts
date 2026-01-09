import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VNPayRequest, VNPayResponse } from '../models/payment.model';
import { ApiResponse } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/payment/api/payment';

  constructor(private http: HttpClient) {}

  createVNPayPayment(request: VNPayRequest): Observable<ApiResponse<VNPayResponse>> {
    return this.http.post<ApiResponse<VNPayResponse>>(`${this.apiUrl}/vnpay/create`, request);
  }

  verifyPayment(params: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/vnpay/callback`, { params });
  }
}
