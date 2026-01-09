export interface VNPayRequest {
  reservationId: string;
  amount: number;
  orderInfo: string;
  returnUrl?: string;
}

export interface VNPayResponse {
  paymentUrl: string;
  transactionId: string;
}
