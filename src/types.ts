export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  timezone?: string;
  theme?: 'dark' | 'light' | 'system';
  notifications?: boolean;
  twoFactorEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityLogItem {
  id: string;
  uid: string;
  action: string;
  timestamp: string;
  device: string;
  status: 'success' | 'warning' | 'failed';
  ipAddress?: string;
}

export interface RateLimitStatus {
  isLocked: boolean;
  attemptsRemaining: number;
  totalAttempts: number;
  lockoutExpiresAt: number | null;
  secondsRemaining: number;
}

export type AuthMode = 'signin' | 'signup' | 'forgot-password';

export type ErrorScreenType = 'none' | '404' | '500' | '401' | '403' | 'quota';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
