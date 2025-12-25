export interface CreateReservationRequest {
  roomTypeId: string;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numAdults?: number;
  numChildren?: number;
  specialRequests?: string;
}

export interface Reservation {
  reservationId: string;
  reservationCode: string;
  userId: string;
  roomTypeId: string;
  roomTypeName: string;
  roomImage?: string;
  checkInDate: string;
  checkOutDate: string;
  numAdults: number;
  numChildren: number;
  totalAmount: number;
  pricePerNight: number;
  specialRequests?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
