import type { RefreshTokenResponse } from '@/types/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://dummyjson.com';

export async function http<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const accessToken = localStorage.getItem('accessToken');

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  // Автоматичне оновлення accessToken при 401 (Interceptor)
  if (response.status === 401 && retry && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return http<T>(path, options, false);
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
      throw new Error('Сесія закінчилася. Будь ласка, увійдіть знову.');
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // ігноруємо помилку парсингу JSON
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, expiresInMins: 30 })
    });

    if (!response.ok) return false;

    const data = (await response.json()) as RefreshTokenResponse;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return true;
  } catch {
    return false;
  }
}
