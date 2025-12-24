import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { RoomType } from '../../models/room-type.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.css'
})
export class RoomDetailComponent implements OnInit {
  room = signal<RoomType | null>(null);
  bookingForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  selectedImage = signal(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private roomService: RoomService,
    private authService: AuthService
  ) {
    this.bookingForm = this.fb.group({
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.loadRoomDetail(roomId);
    }
  }

  loadRoomDetail(id: string): void {
    this.loading.set(true);
    this.roomService.getRoomById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.room.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Không thể tải thông tin phòng');
        this.loading.set(false);
      }
    });
  }

  nextImage(): void {
    const currentRoom = this.room();
    if (currentRoom && currentRoom.images) {
      this.selectedImage.set((this.selectedImage() + 1) % currentRoom.images.length);
    }
  }

  prevImage(): void {
    const currentRoom = this.room();
    if (currentRoom && currentRoom.images) {
      this.selectedImage.set(
        this.selectedImage() === 0 
          ? currentRoom.images.length - 1 
          : this.selectedImage() - 1
      );
    }
  }

  onBook(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.bookingForm.invalid) {
      return;
    }

    const currentRoom = this.room();
    // Navigate to booking confirmation page
    this.router.navigate(['/booking'], {
      queryParams: {
        roomId: currentRoom?.roomTypeId,
        checkIn: this.bookingForm.value.checkInDate,
        checkOut: this.bookingForm.value.checkOutDate
      }
    });
  }
}