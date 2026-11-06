export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  wallet: number;
  phone?: string;
  isBlocked?: boolean;
  joined?: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: number;
}

