export interface ReservationDetail {
  reservationId: string;
  reservationCode: string;

  roomTypeId: string;
  roomTypeName: string;
  roomImage: string | null;

  // Dates
  checkInDate: string;
  checkOutDate: string;

  // Price
  pricePerNight: number;
  totalAmount: number;

  status:
    | 'CONFIRMED'
    | 'CHECKED_IN'
    | 'CHECKED_OUT'
    | 'CANCELLED'
    | 'NO_SHOW';

  paymentStatus: 'UNPAID' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'FAILED';

  // Guest snapshot (flat – đúng BE)
  guestFullName: string;
  guestEmail: string;
  guestPhone: string;

  // Meta
  specialRequests?: string;
  createdAt: string;

  // Permission from BE
  canCancel: boolean;
}

/*export interface ReservationDetailViewModel {
  reservationId: string;
  reservationCode: string;

  roomTypeId: string;
  roomTypeName: string;
  roomImage: string;

  checkInDate: string;
  checkOutDate: string;
  totalNights: number;

  pricePerNight: number;
  totalAmount: number;

  reservationStatus:
    | 'CONFIRMED'
    | 'CHECKED_IN'
    | 'CHECKED_OUT'
    | 'CANCELLED'
    | 'NO_SHOW';

  paymentStatus: 'UNPAID' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'FAILED';

  guest: {
    fullName: string;
    email: string;
    phone: string;
  };

  specialRequests?: string;
  createdAt: string;
}
*/
