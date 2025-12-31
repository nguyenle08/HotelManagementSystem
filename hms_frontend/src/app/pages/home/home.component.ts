import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { RoomType } from '../../models/room-type.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  rooms = signal<RoomType[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  
  // Search filters
  checkInDate: string = '';
  checkOutDate: string = '';
  showingSearchResults = signal(false);

  constructor(
    private roomService: RoomService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    // Set default dates (today + 1 day to tomorrow + 1 day)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    this.checkInDate = tomorrow.toISOString().split('T')[0];
    this.checkOutDate = dayAfter.toISOString().split('T')[0];
  }

  loadRooms(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.showingSearchResults.set(false);
    
    this.roomService.getAllRooms().subscribe({
      next: (response) => {
        if (response.success) {
          this.rooms.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Không thể tải danh sách phòng');
        this.loading.set(false);
      }
    });
  }

  searchRooms(): void {
    if (!this.checkInDate || !this.checkOutDate) {
      this.errorMessage.set('Vui lòng chọn ngày check-in và check-out');
      return;
    }

    if (this.checkInDate >= this.checkOutDate) {
      this.errorMessage.set('Ngày check-out phải sau ngày check-in');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    
    this.roomService.searchRooms({
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.rooms.set(response.data);
          this.showingSearchResults.set(true);
        } else {
          this.errorMessage.set(response.message || 'Không tìm thấy phòng');
          this.rooms.set([]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Không thể tìm kiếm phòng');
        this.rooms.set([]);
        this.loading.set(false);
      }
    });
  }

  clearSearch(): void {
    this.checkInDate = '';
    this.checkOutDate = '';
    this.loadRooms();
  }

  viewRoomDetail(roomId: string): void {
    // Truyền dates nếu đang search
    if (this.showingSearchResults() && this.checkInDate && this.checkOutDate) {
      this.router.navigate(['/room-types', roomId], {
        queryParams: {
          checkIn: this.checkInDate,
          checkOut: this.checkOutDate
        }
      });
    } else {
      this.router.navigate(['/room-types', roomId]);
    }
  }

  bookNow(roomId: string): void {
    this.viewRoomDetail(roomId);
  }

  formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
