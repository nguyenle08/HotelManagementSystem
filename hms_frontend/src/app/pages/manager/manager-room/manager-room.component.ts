import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../../services/room.service';
import { RoomStatus } from '../../../models/room-status.model';
import { RoomType } from '../../../models/room-type.model';
import { RoomTypeService } from '../../../services/room-type.service';
import { ReservationService } from '../../../services/reservation.service';
import { Reservation } from '../../../models/reservation.model';

@Component({
  selector: 'app-manager-room',
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-room.component.html',
  styleUrl: './manager-room.component.css'
})
export class ManagerRoomComponent implements OnInit {
  rooms: RoomStatus[] = [];
  filteredRooms: RoomStatus[] = [];
  roomTypes: RoomType[] = [];
  reservations: Reservation[] = [];

  searchTerm: string = '';
  filterStatus: 'ALL' | 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED' | 'OCCUPIED' | 'RESERVED' = 'ALL';


  // summary
  get totalRooms(): number {
    return this.rooms.length;
  }

  get activeRooms(): number {
    return this.rooms.filter(r => r.status === 'ACTIVE').length;
  }

  get maintenanceRooms(): number {
    return this.rooms.filter(r => r.status === 'MAINTENANCE').length;
  }

  get decommissionedRooms(): number {
    return this.rooms.filter(r => r.status === 'DECOMMISSIONED').length;
  }

  get usingRooms(): number {
    // Count rooms with OCCUPIED or RESERVED status
    return this.rooms.filter(r => r.status === 'OCCUPIED' || r.status === 'RESERVED').length;
  }

  get freeRooms(): number {
    // Count rooms that are ACTIVE (available)
    return this.rooms.filter(r => r.status === 'ACTIVE').length;
  }


  // modal state
  showAddModal = false;
  showEditModal = false;
  showDeleteConfirm = false;

  selectedRoom: RoomStatus | null = null;

  roomForm = {
    roomNumber: '',
    floor: 1,
    status: 'ACTIVE' as 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED' | 'RESERVED' | 'OCCUPIED',
    roomTypeId: ''
  };


  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private roomService: RoomService,
    private roomTypeService: RoomTypeService
    , private reservationService: ReservationService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.roomTypeService.getAllRoomTypes().subscribe({
      next: (types) => {
        this.roomTypes = types;
      },
      error: () => { }
    });

    this.reservationService.getAllReservations().subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          this.reservations = res.data;
        }
      },
      error: () => { }
    });

    this.roomService.getRoomStatuses().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rooms = res.data;
          this.applyFilter();
        } else {
          this.errorMessage = res.message || 'Không thể tải danh sách phòng';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading rooms:', err);
        this.errorMessage = 'Không thể tải danh sách phòng';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    let result = [...this.rooms];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(r =>
        r.roomNumber.toLowerCase().includes(term) ||
        (r.roomTypeName || '').toLowerCase().includes(term)
      );
    }

    if (this.filterStatus !== 'ALL') {
      result = result.filter(r => r.status === this.filterStatus);
    }

    this.filteredRooms = result;
  }

  getRoomTypeName(roomTypeId: string): string {
    return this.roomTypes.find(rt => rt.roomTypeId === roomTypeId)?.name || '---';
  }

  getRoomImage(room: import('../../../models/room-status.model').RoomStatus): string {
    // Prefer images included on the room (mapped from roomType by backend)
    if (room.images && room.images.length > 0) {
      return room.images[0];
    }

    // Fallback: try to find roomType object loaded in the component
    const rt = this.roomTypes.find(r => r.roomTypeId === room.roomTypeId);
    if (rt && rt.images && rt.images.length > 0) {
      return rt.images[0];
    }

    return 'assets/images/default-room.jpg';
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Trống';
      case 'OCCUPIED':
        return 'Đang sử dụng';
      case 'RESERVED':
        return 'Đã đặt trước';
      case 'MAINTENANCE':
        return 'Bảo trì';
      case 'DECOMMISSIONED':
        return 'Ngừng sử dụng';
      default:
        return status;
    }
  }

  // modal helpers
  openAddModal(): void {
    this.roomForm = {
      roomNumber: '',
      floor: 1,
      status: 'ACTIVE',
      roomTypeId: this.roomTypes[0]?.roomTypeId || ''
    };
    this.selectedRoom = null;
    this.showAddModal = true;
    this.errorMessage = '';
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openEditModal(room: RoomStatus): void {
    this.selectedRoom = room;

    this.roomForm = {
      roomNumber: room.roomNumber,
      floor: room.floor,
      status: room.status as 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED' | 'RESERVED' | 'OCCUPIED',
      roomTypeId: room.roomTypeId
    };
    this.showEditModal = true;
    this.errorMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedRoom = null;
  }

  openDeleteConfirm(room: RoomStatus): void {
    this.selectedRoom = room;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.selectedRoom = null;
  }

  // CRUD actions
  submitAdd(): void {
    if (!this.roomForm.roomNumber.trim() || !this.roomForm.roomTypeId) {
      this.errorMessage = 'Vui lòng nhập số phòng và chọn loại phòng';
      return;
    }

    this.isLoading = true;
    this.roomService.createRoom(this.roomForm).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rooms.push(res.data);
          this.applyFilter();
          this.showSuccess('Thêm phòng thành công');
          this.closeAddModal();
        } else {
          this.errorMessage = res.message || 'Không thể thêm phòng';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error creating room:', err);
        this.errorMessage = 'Không thể thêm phòng';
        this.isLoading = false;
      }
    });
  }

  submitEdit(): void {
    if (!this.selectedRoom) return;
    if (!this.roomForm.roomNumber.trim() || !this.roomForm.roomTypeId) {
      this.errorMessage = 'Vui lòng nhập số phòng và chọn loại phòng';
      return;
    }

    this.isLoading = true;
    this.roomService.updateRoom(this.selectedRoom.roomId, this.roomForm).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const index = this.rooms.findIndex(r => r.roomId === res.data!.roomId);
          if (index !== -1) {
            this.rooms[index] = res.data;
          }
          this.applyFilter();
          this.showSuccess('Cập nhật phòng thành công');
          this.closeEditModal();
        } else {
          this.errorMessage = res.message || 'Không thể cập nhật phòng';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error updating room:', err);
        this.errorMessage = 'Không thể cập nhật phòng';
        this.isLoading = false;
      }
    });
  }

  confirmDelete(): void {
    if (!this.selectedRoom) return;

    this.isLoading = true;
    this.roomService.deleteRoom(this.selectedRoom.roomId).subscribe({
      next: (res) => {
        if (res.success) {
          this.rooms = this.rooms.filter(r => r.roomId !== this.selectedRoom!.roomId);
          this.applyFilter();
          this.showSuccess('Xóa phòng thành công');
        } else {
          this.errorMessage = res.message || 'Không thể xóa phòng';
        }
        this.closeDeleteConfirm();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error deleting room:', err);
        this.errorMessage = 'Không thể xóa phòng';
        this.closeDeleteConfirm();
        this.isLoading = false;
      }
    });
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => (this.successMessage = ''), 3000);
  }
}
