import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomType, RoomTypeFormData } from '../models/room-type.model';

@Injectable({
  providedIn: 'root'
})
export class RoomTypeService {
  private apiUrl = 'http://localhost:8080/room/api/room-types';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllRoomTypes(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getRoomTypeById(id: string): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createRoomType(roomType: RoomTypeFormData): Observable<RoomType> {
    return this.http.post<RoomType>(this.apiUrl, roomType, { headers: this.getHeaders() });
  }

  updateRoomType(id: string, roomType: RoomTypeFormData): Observable<RoomType> {
    return this.http.put<RoomType>(`${this.apiUrl}/${id}`, roomType, { headers: this.getHeaders() });
  }

  deleteRoomType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<{ url: string }>(`${this.apiUrl}/upload-image`, formData, { headers });
  }
}
