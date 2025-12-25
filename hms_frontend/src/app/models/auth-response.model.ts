export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: string;
  username: string;
  email: string;
  fullname: string;
  role: 'USER' | 'ADMIN' | 'STAFF' | 'MANAGER';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}
