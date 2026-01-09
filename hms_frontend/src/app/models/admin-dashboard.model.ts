export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  staffCount: number;
  lockedAccounts: number;
  roleStats: RoleStat[];
  accountStatus: AccountStatus[];
  recentActivities: RecentActivity[];
}

export interface RoleStat {
  role: string;
  count: number;
  percent: number;
}

export interface AccountStatus {
  status: string;
  count: number;
}

export interface RecentActivity {
  message: string;
  time: string;
}

export interface AdminUser {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password?: string; // Only for creation
  role: string;
  status: string;
  lastLogin: string;
}