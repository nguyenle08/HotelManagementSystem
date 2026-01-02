// Action hôm nay
export interface TodayAction {
  type: 'CHECKIN' | 'CHECKOUT' | 'OVERDUE';
  time: string;
  guestName: string;
  roomNumber: string;
  reservationId: number;
  typeLabel?: string; // CHECK-IN / CHECK-OUT / Overdue
}

// Snapshot phòng
export interface RoomSnapshot {
  available: number;
  occupied: number;
  cleaning: number;
  attention: number;
  cleaningOverdue?: number; // số phòng cleaning quá hạn
}

// Alert cho staff
export interface AlertItem {
  type: string; // ví dụ: OVERDUE_CHECKOUT, UNPAID_BOOKING
  message: string;
}

// Summary mini
export interface DashboardSummary {
  checkInToday: number;
  checkOutToday: number;
  overdue?: number;
}

// Response tổng hợp dashboard
export interface DashboardResponse {
  todayActions: TodayAction[];
  roomSnapshot: RoomSnapshot;
  alerts: AlertItem[];
  summary: DashboardSummary;
}
