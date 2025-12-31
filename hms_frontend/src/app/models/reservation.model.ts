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
  
  // Pricing
  baseAmount: number;
  additionalCharges?: number;
  discountAmount?: number;
  totalAmount: number;
  pricePerNight: number;
  
  // Payment tracking
  paymentStatus: 'UNPAID' | 'PAID' | 'PARTIAL' | 'REFUNDED';
  paidAmount: number;
  remainingAmount?: number;
  
  // Cancellation
  cancellationPolicy?: string;
  canCancelUntil?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancellationFee?: number;
  
  // Notes
  specialRequests?: string;
  staffNotes?: string;
  
  // Status
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
  
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
