export interface RoomStatus {
  roomId: string;
  roomNumber: string;
  floor: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
  roomTypeId: string;
  roomTypeName?: string;
}
