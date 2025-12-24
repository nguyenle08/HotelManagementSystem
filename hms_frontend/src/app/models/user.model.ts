export interface User {
  userId: string;
  username: string;
  email: string;
  fullname: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'STAFF' | 'MANAGER';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  fullname: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
