export interface RoomStatus {
  roomId: string;
  roomNumber: string;
  floor: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED' | 'OCCUPIED' | 'RESERVED';
  roomTypeId: string;
  roomTypeName?: string;
  images?: string[];
  reservationId?: string;
  guestName?: string;
  checkInDate?: string;
  checkOutDate?: string;
}
