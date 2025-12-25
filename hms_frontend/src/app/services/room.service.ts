import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomType, RoomSearchRequest } from '../models/room-type.model';
import { ApiResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
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

  searchRooms(searchData: RoomSearchRequest): Observable<ApiResponse<RoomType[]>> {
    return this.http.post<ApiResponse<RoomType[]>>(`${this.apiUrl}/search`, searchData);
  }
}