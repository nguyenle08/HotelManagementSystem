import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomTypeService } from '../../../services/room-type.service';
import { RoomType, RoomTypeFormData } from '../../../models/room-type.model';

@Component({
  selector: 'app-manager-room-type',
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-room-type.component.html',
  styleUrl: './manager-room-type.component.css'
})
export class ManagerRoomTypeComponent implements OnInit {
  roomTypes: RoomType[] = [];
  filteredRoomTypes: RoomType[] = [];
  searchTerm: string = '';
  
  // Modal states
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showDetailModal: boolean = false;
  showDeleteConfirm: boolean = false;
  
  // Current room type for edit/detail/delete
  selectedRoomType: RoomType | null = null;
  
  // Form data
  roomTypeForm: RoomTypeFormData = this.getEmptyForm();
  // Trạng thái upload ảnh
  isUploadingImage: boolean = false;
  imageUploadError: string = '';
  
  // Available amenities
  availableAmenities: string[] = [
    'WiFi miễn phí',
    'TV màn hình phẳng',
    'Điều hòa',
    'Minibar',
    'Két an toàn',
    'Bồn tắm',
    'Ban công',
    'Máy pha cà phê',
    'Máy sấy tóc',
    'Dép đi trong phòng'
  ];
  
  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private roomTypeService: RoomTypeService) {}

  ngOnInit(): void {
    this.loadRoomTypes();
  }

  private getEmptyForm(): RoomTypeFormData {
    return {
      name: '',
      description: '',
      basePrice: 0,
      maxGuests: 2,
      bedType: '',
      sizeSqm: 0,
      amenities: [],
      images: []
    };
  }

  loadRoomTypes(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.roomTypeService.getAllRoomTypes().subscribe({
      next: (data) => {
        this.roomTypes = data;
        this.filteredRoomTypes = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading room types:', error);
        this.errorMessage = 'Không thể tải danh sách loại phòng. Vui lòng kiểm tra backend đã chạy chưa.';
        this.isLoading = false;
        // Set empty arrays to avoid undefined errors
        this.roomTypes = [];
        this.filteredRoomTypes = [];
      }
    });
  }

  searchRoomTypes(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRoomTypes = this.roomTypes;
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredRoomTypes = this.roomTypes.filter(rt => 
      rt.name.toLowerCase().includes(term) || 
      rt.description.toLowerCase().includes(term)
    );
  }

  // Add modal methods
  openAddModal(): void {
    this.roomTypeForm = this.getEmptyForm();
    this.imageUploadError = '';
    this.showAddModal = true;
    this.errorMessage = '';
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.roomTypeForm = this.getEmptyForm();
    this.imageUploadError = '';
  }

  submitAdd(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.roomTypeService.createRoomType(this.roomTypeForm).subscribe({
      next: (newRoomType) => {
        this.roomTypes.push(newRoomType);
        this.filteredRoomTypes = this.roomTypes;
        this.showSuccessMessage('Thêm loại phòng thành công');
        this.closeAddModal();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating room type:', error);
        this.errorMessage = 'Không thể thêm loại phòng. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }

  // Edit modal methods
  openEditModal(roomType: RoomType): void {
    this.selectedRoomType = roomType;
    this.roomTypeForm = {
      name: roomType.name,
      description: roomType.description,
      basePrice: roomType.basePrice,
      maxGuests: roomType.maxGuests,
      bedType: roomType.bedType || '',
      sizeSqm: roomType.sizeSqm || 0,
      amenities: roomType.amenities || [],
      images: roomType.images || []
    };
    this.imageUploadError = '';
    this.showEditModal = true;
    this.errorMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedRoomType = null;
    this.roomTypeForm = this.getEmptyForm();
    this.imageUploadError = '';
  }

  submitEdit(): void {
    if (!this.validateForm() || !this.selectedRoomType?.roomTypeId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.roomTypeService.updateRoomType(this.selectedRoomType.roomTypeId, this.roomTypeForm).subscribe({
      next: (updatedRoomType) => {
        const index = this.roomTypes.findIndex(rt => rt.roomTypeId === updatedRoomType.roomTypeId);
        if (index !== -1) {
          this.roomTypes[index] = updatedRoomType;
          this.filteredRoomTypes = this.roomTypes;
        }
        this.showSuccessMessage('Cập nhật loại phòng thành công');
        this.closeEditModal();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating room type:', error);
        this.errorMessage = 'Không thể cập nhật loại phòng. Vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }

  // Detail modal methods
  openDetailModal(roomType: RoomType): void {
    this.selectedRoomType = roomType;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedRoomType = null;
  }

  // Delete methods
  openDeleteConfirm(roomType: RoomType): void {
    this.selectedRoomType = roomType;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.selectedRoomType = null;
  }

  confirmDelete(): void {
    if (!this.selectedRoomType?.roomTypeId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.roomTypeService.deleteRoomType(this.selectedRoomType.roomTypeId).subscribe({
      next: () => {
        this.roomTypes = this.roomTypes.filter(rt => rt.roomTypeId !== this.selectedRoomType?.roomTypeId);
        this.filteredRoomTypes = this.roomTypes;
        this.showSuccessMessage('Xóa loại phòng thành công');
        this.closeDeleteConfirm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting room type:', error);
        this.errorMessage = 'Không thể xóa loại phòng. Có thể loại phòng này đang được sử dụng.';
        this.closeDeleteConfirm();
        this.isLoading = false;
      }
    });
  }

  // Amenity management
  toggleAmenity(amenity: string): void {
    if (!this.roomTypeForm.amenities) {
      this.roomTypeForm.amenities = [];
    }
    
    const index = this.roomTypeForm.amenities.indexOf(amenity);
    if (index > -1) {
      this.roomTypeForm.amenities.splice(index, 1);
    } else {
      this.roomTypeForm.amenities.push(amenity);
    }
  }

  isAmenitySelected(amenity: string): boolean {
    return this.roomTypeForm.amenities?.includes(amenity) || false;
  }

  // Upload ảnh phòng
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.isUploadingImage = true;
    this.imageUploadError = '';

    this.roomTypeService.uploadImage(file).subscribe({
      next: (res) => {
        if (!this.roomTypeForm.images) {
          this.roomTypeForm.images = [];
        }
        // Normalize returned URL to relative path so dev proxy and NgOptimizedImage work.
        try {
          const u = new URL(res.url);
          const normalized = u.pathname + (u.search || '');
          this.roomTypeForm.images.push(normalized);
        } catch (e) {
          // If it's not a full URL, push as-is
          this.roomTypeForm.images.push(res.url);
        }
        this.isUploadingImage = false;
        // reset input
        input.value = '';
      },
      error: (err) => {
        console.error('Error uploading image:', err);
        this.imageUploadError = 'Upload ảnh thất bại. Vui lòng thử lại.';
        this.isUploadingImage = false;
      }
    });
  }

  removeImage(index: number): void {
    if (!this.roomTypeForm.images) {
      return;
    }

    if (index >= 0 && index < this.roomTypeForm.images.length) {
      this.roomTypeForm.images.splice(index, 1);
    }
  }

  // Validation
  private validateForm(): boolean {
    if (!this.roomTypeForm.name.trim()) {
      this.errorMessage = 'Vui lòng nhập tên loại phòng';
      return false;
    }
    if (!this.roomTypeForm.description.trim()) {
      this.errorMessage = 'Vui lòng nhập mô tả';
      return false;
    }
    if (this.roomTypeForm.basePrice <= 0) {
      this.errorMessage = 'Giá phòng phải lớn hơn 0';
      return false;
    }
    if (this.roomTypeForm.maxGuests <= 0) {
      this.errorMessage = 'Sức chứa phải lớn hơn 0';
      return false;
    }
    return true;
  }

  // Helper methods
  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + 'đ';
  }

  getDefaultImage(roomType: RoomType): string {
    if (roomType.images && roomType.images.length > 0) {
      return roomType.images[0];
    }
    return 'assets/images/default-room.jpg';
  }
}
