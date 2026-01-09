export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  staffCount: number;
  lockedAccounts: number;
  roleStats: Array<{ role: string; count: number; percent: number }>;
  accountStatus: Array<{ status: string; count: number; percent: number }>;
  recentActivities: Array<{ type: string; message: string; time: string }>;
}

export interface AdminUser {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  lastLogin: string;
}