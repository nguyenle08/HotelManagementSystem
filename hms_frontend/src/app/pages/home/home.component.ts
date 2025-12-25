import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { RoomType } from '../../models/room-type.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  rooms = signal<RoomType[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private roomService: RoomService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading.set(true);
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

  viewRoomDetail(roomId: string): void {
    this.router.navigate(['/room-types', roomId]);
  }

  bookNow(roomId: string): void {
    this.router.navigate(['/room-types', roomId]);
  }
}
