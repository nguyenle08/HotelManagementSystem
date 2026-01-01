import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomStatus } from '../../../models/room-status.model';
import { RoomService } from '../../../services/room.service';

type RoomStatusView = Omit<RoomStatus, 'status'> & {
  status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
  guestName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  reservationId?: string;
};

@Component({
  selector: 'app-staff-status-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-status-reservation.component.html',
  styleUrl: './staff-status-reservation.component.css',
})
export class StaffStatusReservationComponent implements OnInit {
  rooms = signal<RoomStatusView[]>([]);
  filteredRooms = signal<RoomStatusView[]>([]);
  selectedFloor = signal(1);
  loading = signal(false);

  // Modal states
  showDetailModal = signal(false);
  showEditModal = signal(false);
  selectedRoom = signal<RoomStatusView | null>(null);

  // Edit form
  editForm = {
    status: 'AVAILABLE',
    note: '',
  };

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  private mapStatus(status: string): RoomStatusView['status'] {
    switch (status) {
      case 'ACTIVE':
        return 'AVAILABLE';
      case 'MAINTENANCE':
        return 'MAINTENANCE';
      case 'DECOMMISSIONED':
        return 'CLEANING';
      default:
        return 'AVAILABLE';
    }
  }

  loadRooms(): void {
    this.loading.set(true);
    this.roomService.getRoomStatuses().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const mapped: RoomStatusView[] = response.data.map((room) => ({
            ...room,
            status: this.mapStatus(room.status),
          }));
          this.rooms.set(mapped);
          this.filterByFloor(this.selectedFloor());
        } else {
          this.rooms.set([]);
          this.filteredRooms.set([]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.rooms.set([]);
        this.filteredRooms.set([]);
        this.loading.set(false);
      },
    });
  }

  filterByFloor(floor: number): void {
    this.selectedFloor.set(floor);
    const filtered = this.rooms().filter((r) => r.floor === floor);
    this.filteredRooms.set(filtered);
  }

  get availableCount(): number {
    return this.rooms().filter((r) => r.status === 'AVAILABLE').length;
  }

  get occupiedCount(): number {
    return this.rooms().filter((r) => r.status === 'OCCUPIED').length;
  }

  get cleaningCount(): number {
    return this.rooms().filter((r) => r.status === 'CLEANING').length;
  }

  get maintenanceCount(): number {
    return this.rooms().filter((r) => r.status === 'MAINTENANCE').length;
  }

  viewRoomDetail(room: RoomStatusView): void {
    if (room.status === 'OCCUPIED') {
      this.selectedRoom.set(room);
      this.showDetailModal.set(true);
    }
  }

  openEditModal(room: RoomStatusView): void {
    this.selectedRoom.set(room);
    this.editForm = {
      status: room.status,
      note: '',
    };
    this.showEditModal.set(true);
  }

  closeModals(): void {
    this.showDetailModal.set(false);
    this.showEditModal.set(false);
    this.selectedRoom.set(null);
  }

  saveRoomStatus(): void {
    const room = this.selectedRoom();
    if (!room) return;

    // TODO: Call API to update room status
    alert('Cập nhật trạng thái phòng thành công!');
    this.closeModals();
    this.loadRooms();
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'Sẵn sàng';
      case 'OCCUPIED':
        return 'Đang sử dụng';
      case 'CLEANING':
        return 'Đang dọn dẹp';
      case 'MAINTENANCE':
        return 'Bảo trì';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'AVAILABLE':
        return 'available';
      case 'OCCUPIED':
        return 'occupied';
      case 'CLEANING':
        return 'cleaning';
      case 'MAINTENANCE':
        return 'maintenance';
      default:
        return '';
        1;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN');
  }
}
