export type UserRole = 'welder' | 'subcontractor' | 'client' | 'accountant' | 'admin';
export type SubscriptionTier = 'free' | 'pro' | 'business' | 'enterprise';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  companyName?: string;
  isActive: boolean;
  emailVerified: boolean;
  subscriptionTier: SubscriptionTier;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  companyName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
