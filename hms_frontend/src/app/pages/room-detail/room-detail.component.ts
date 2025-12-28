import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services/room.service';
import { ReservationService } from '../../services/reservation.service';
import { TokenService } from '../../core/services/token.service';
import { RoomType } from '../../models/room-type.model';
import { CreateReservationRequest } from '../../models/reservation.model';

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
  successMessage = signal('');
  selectedImage = signal(0);
  totalPrice = signal<number>(0);
  numberOfNights = signal<number>(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private roomService: RoomService,
    private reservationService: ReservationService,
    private tokenService: TokenService
  ) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    this.bookingForm = this.fb.group({
      checkInDate: [today, Validators.required],
      checkOutDate: [tomorrow, Validators.required]
    });

    // Calculate price when dates change
    this.bookingForm.valueChanges.subscribe(() => {
      this.calculatePrice();
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
          this.calculatePrice();
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Không thể tải thông tin phòng');
        this.loading.set(false);
      }
    });
  }

  calculatePrice(): void {
    const currentRoom = this.room();
    if (!currentRoom) return;

    const checkIn = this.bookingForm.get('checkInDate')?.value;
    const checkOut = this.bookingForm.get('checkOutDate')?.value;

    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        this.numberOfNights.set(nights);
        this.totalPrice.set(nights * currentRoom.basePrice);
      } else {
        this.numberOfNights.set(0);
        this.totalPrice.set(0);
      }
    }
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
    // Check if user is logged in
    if (!this.tokenService.isAuthenticated()) {
      this.errorMessage.set('Vui lòng đăng nhập để đặt phòng');
      setTimeout(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      }, 1500);
      return;
    }

    if (this.bookingForm.invalid) {
      this.errorMessage.set('Vui lòng chọn ngày check-in và check-out');
      return;
    }

    // Validate dates
    const checkIn = new Date(this.bookingForm.value.checkInDate!);
    const checkOut = new Date(this.bookingForm.value.checkOutDate!);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      this.errorMessage.set('Ngày check-in không được là ngày quá khứ');
      return;
    }

    if (checkOut <= checkIn) {
      this.errorMessage.set('Ngày check-out phải sau ngày check-in');
      return;
    }

    const currentRoom = this.room();
    if (!currentRoom) {
      this.errorMessage.set('Không tìm thấy thông tin phòng');
      return;
    }

    // Create reservation request
    const request: CreateReservationRequest = {
      roomTypeId: currentRoom.roomTypeId,
      checkInDate: this.bookingForm.value.checkInDate!,
      checkOutDate: this.bookingForm.value.checkOutDate!,
      numAdults: 1,     //thêm
      numChildren: 0    //thêm
    };

    this.loading.set(true);
    this.errorMessage.set('');

    this.reservationService.createReservation(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          alert('Đặt phòng thành công! Mã đặt phòng: ' + response.data.reservationId);
          this.router.navigate(['/my-reservations']);
        } else {
          this.errorMessage.set(response.message || 'Không thể đặt phòng');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Đã xảy ra lỗi khi đặt phòng');
      }
    });
  }
}