export interface RoomType {
  roomTypeId?: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  bedType?: string;
  sizeSqm?: number;
  amenities?: string[];
  images?: string[];
  isActive?: boolean;
  totalRooms?: number;
  availableRooms?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoomSearchRequest {
  checkInDate: string;
  checkOutDate: string;
  guests?: number;
}

export interface RoomTypeFormData {
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  bedType?: string;
  sizeSqm?: number;
  amenities?: string[];
  images?: string[];
}
