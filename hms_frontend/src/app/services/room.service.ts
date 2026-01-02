import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomType, RoomSearchRequest } from '../models/room-type.model';
import { ApiResponse } from '../models/auth-response.model';
import { RoomStatus } from '../models/room-status.model';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private apiUrl = 'http://localhost:8080/room/api/rooms';

  constructor(private http: HttpClient) {}

  getAllRooms(): Observable<ApiResponse<RoomType[]>> {
    return this.http.get<ApiResponse<RoomType[]>>(this.apiUrl);
  }

  getRoomById(id: string): Observable<ApiResponse<RoomType>> {
    return this.http.get<ApiResponse<RoomType>>(`${this.apiUrl}/${id}`);
  }

  searchRooms(
    searchData: RoomSearchRequest
  ): Observable<ApiResponse<RoomType[]>> {
    return this.http.post<ApiResponse<RoomType[]>>(
      `${this.apiUrl}/search`,
      searchData
    );
  }

  getRoomStatuses(): Observable<ApiResponse<RoomStatus[]>> {
    return this.http.get<ApiResponse<RoomStatus[]>>(`${this.apiUrl}/status`);
  }

  createRoom(payload: {
    roomNumber: string;
    floor: number;
    status: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
    roomTypeId: string;
  }): Observable<ApiResponse<RoomStatus>> {
    return this.http.post<ApiResponse<RoomStatus>>(`${this.apiUrl}/manage`, payload);
  }

  updateRoom(
    id: string,
    payload: {
      roomNumber: string;
      floor: number;
      status: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
      roomTypeId: string;
    }
  ): Observable<ApiResponse<RoomStatus>> {
    return this.http.put<ApiResponse<RoomStatus>>(
      `${this.apiUrl}/manage/${id}`,
      payload
    );
  }

  deleteRoom(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/manage/${id}`);
  }
}
