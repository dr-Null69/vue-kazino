import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ServiceProvider } from '@/services/service-provider';
import type { LoginCredentials, AuthResponse } from '@/types/auth';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const user = ref<Omit<AuthResponse, 'accessToken' | 'refreshToken'> | null>(
    localStorage.getItem('authUser') ? JSON.parse(localStorage.getItem('authUser')!) : null
  );

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => Boolean(accessToken.value));

  async function login(credentials: LoginCredentials) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await ServiceProvider.auth.login(credentials);
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;

      const userData = {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        gender: response.gender,
        image: response.image
      };
      user.value = userData;

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('authUser', JSON.stringify(userData));
    } catch (e) {
      error.value = (e as Error).message || 'Невірний логін або пароль';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCurrentUser() {
    if (!accessToken.value) return;
    try {
      const me = await ServiceProvider.auth.getMe();
      user.value = {
        id: me.id,
        username: me.username,
        email: me.email,
        firstName: me.firstName,
        lastName: me.lastName,
        gender: me.gender,
        image: me.image || ''
      };
      localStorage.setItem('authUser', JSON.stringify(user.value));
    } catch {
      logout();
    }
  }

  function logout() {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser');
  }

  return {
    accessToken,
    refreshToken,
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    fetchCurrentUser,
    logout
  };
});
