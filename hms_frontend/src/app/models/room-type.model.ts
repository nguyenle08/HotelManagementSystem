export interface RoomType {
  roomTypeId: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  bedType: string;
  sizeSqm: number;
  amenities: string[];
  images: string[];
  isActive: boolean;
  availableRooms: number;
}

export interface RoomSearchRequest {
  checkInDate: string;
  checkOutDate: string;
  guests?: number;
}
