export interface Profile {
  userId: string;
  fullName: string;
  phone: string;
  role: string;

  cccd?: string;
  address?: string;

  // Guest
  loyaltyPoints?: number;
  memberTier?: string;

  // Employee
  employeeCode?: string;
  department?: string;
  position?: string;
}
