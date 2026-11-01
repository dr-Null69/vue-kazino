import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ServiceProvider } from '@/services/service-provider';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user';

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const total = ref(0);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Локальний кеш змін (оскільки DummyJSON не зберігає мутації на сервері)
  const createdUsers = ref<User[]>([]);
  const updatedUsersMap = ref<Record<number, User>>({});
  const deletedUserIds = ref<Set<number>>(new Set());

  // Список переможців лотереї серед користувачів
  const winners = ref<User[]>([]);

  async function fetchUsers(params: { limit: number; skip: number; q?: string }) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await ServiceProvider.users.getAllWithMeta(params);

      // Застосовуємо локальні зміни до відповіді сервера
      const serverUsers = response.users
        .filter((u) => !deletedUserIds.value.has(u.id))
        .map((u) => updatedUsersMap.value[u.id] ?? u);

      // Фільтруємо локально створених юзерів під пошуковий запит
      const query = (params.q || '').toLowerCase().trim();
      const matchingCreated = createdUsers.value.filter((u) => {
        if (deletedUserIds.value.has(u.id)) return false;
        if (!query) return true;
        return (
          u.firstName.toLowerCase().includes(query) ||
          u.lastName.toLowerCase().includes(query) ||
          u.username.toLowerCase().includes(query)
        );
      });

      // На першій сторінці додаємо нових створених користувачів на початок списку
      users.value = params.skip === 0 ? [...matchingCreated, ...serverUsers] : serverUsers;
      total.value = response.total + matchingCreated.length - deletedUserIds.value.size;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      isLoading.value = false;
    }
  }

  async function getUserById(id: number): Promise<User> {
    if (deletedUserIds.value.has(id)) {
      throw new Error('Користувача було видалено');
    }
    if (updatedUsersMap.value[id]) {
      return updatedUsersMap.value[id];
    }
    const localCreated = createdUsers.value.find((u) => u.id === id);
    if (localCreated) {
      return localCreated;
    }
    return await ServiceProvider.users.getById(id);
  }

  async function createUser(dto: CreateUserDto): Promise<User> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await ServiceProvider.users.create(dto);
      const newUser: User = {
        ...response,
        ...dto,
        id: Date.now() // Унікальний локальний ID
      };
      createdUsers.value.unshift(newUser);
      users.value.unshift(newUser);
      total.value += 1;
      return newUser;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    isLoading.value = true;
    error.value = null;
    try {
      const isLocal = createdUsers.value.some((u) => u.id === id);
      let apiResponse: Partial<User> = {};
      if (!isLocal) {
        apiResponse = await ServiceProvider.users.update(id, dto);
      }

      const existing =
        users.value.find((u) => u.id === id) ||
        createdUsers.value.find((u) => u.id === id) ||
        updatedUsersMap.value[id];

      const updated: User = {
        ...(existing as User),
        ...apiResponse,
        ...dto,
        id
      };

      updatedUsersMap.value[id] = updated;

      const createdIdx = createdUsers.value.findIndex((u) => u.id === id);
      if (createdIdx !== -1) createdUsers.value[createdIdx] = updated;

      const listIdx = users.value.findIndex((u) => u.id === id);
      if (listIdx !== -1) users.value[listIdx] = updated;

      const winIdx = winners.value.findIndex((w) => w.id === id);
      if (winIdx !== -1) winners.value[winIdx] = updated;

      return updated;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(id: number) {
    isLoading.value = true;
    error.value = null;
    try {
      const isLocal = createdUsers.value.some((u) => u.id === id);
      if (!isLocal) {
        await ServiceProvider.users.delete(id);
      }
      deletedUserIds.value.add(id);
      createdUsers.value = createdUsers.value.filter((u) => u.id !== id);
      delete updatedUsersMap.value[id];
      users.value = users.value.filter((u) => u.id !== id);
      winners.value = winners.value.filter((w) => w.id !== id);
      total.value = Math.max(0, total.value - 1);
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  function pickWinner() {
    if (winners.value.length >= 3) return;
    const winnerIds = new Set(winners.value.map((w) => w.id));
    const candidates = users.value.filter((u) => !winnerIds.has(u.id));
    if (candidates.length === 0) return;
    const randomIndex = Math.floor(Math.random() * candidates.length);
    winners.value.push(candidates[randomIndex]);
  }

  function removeWinner(id: number) {
    winners.value = winners.value.filter((w) => w.id !== id);
  }

  return {
    users,
    total,
    isLoading,
    error,
    winners,
    fetchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    pickWinner,
    removeWinner
  };
});
