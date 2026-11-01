import { http } from '@/api/http-client';
import type { LoginCredentials, AuthResponse, RefreshTokenResponse } from '@/types/auth';
import type { User } from '@/types/user';

export class AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse> {
    return http<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  getMe(): Promise<User> {
    return http<User>('/auth/me');
  }

  refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    return http<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken, expiresInMins: 30 })
    });
  }
}
