<script setup lang="ts">
import { ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { useUsersStore } from '@/stores/users.store';
import type { User } from '@/types/user';

const props = defineProps<{
  id: string;
}>();

const route = useRoute();
const usersStore = useUsersStore();

const user = ref<User | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

async function loadUser() {
  isLoading.value = true;
  error.value = null;
  try {
    user.value = await usersStore.getUserById(Number(props.id));
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    isLoading.value = false;
  }
}

watch(
  () => [props.id, route.fullPath],
  () => {
    loadUser();
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <div class="mb-3">
      <RouterLink to="/users" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1"></i>Назад до списку користувачів
      </RouterLink>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="user" class="card shadow-sm border-0 mb-4">
      <div class="card-body p-4">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div class="d-flex align-items-center gap-3">
            <img
              v-if="user.image"
              :src="user.image"
              :alt="user.firstName"
              class="rounded-circle border"
              style="width: 72px; height: 72px; object-fit: cover;"
            />
            <div>
              <h3 class="fw-bold mb-1">{{ user.firstName }} {{ user.lastName }}</h3>
              <span class="badge bg-primary me-2">@{{ user.username }}</span>
              <span class="text-muted">ID: #{{ user.id }}</span>
            </div>
          </div>

          <RouterLink
            v-if="route.name !== 'user-edit'"
            :to="{ name: 'user-edit', params: { id: user.id } }"
            class="btn btn-warning"
          >
            <i class="bi bi-pencil-square me-1"></i>Редагувати профіль
          </RouterLink>
        </div>

        <hr class="my-4" />

        <div class="row g-3">
          <div class="col-md-4">
            <div class="text-muted small">Email</div>
            <div class="fw-semibold">{{ user.email }}</div>
          </div>
          <div class="col-md-4">
            <div class="text-muted small">Телефон</div>
            <div class="fw-semibold">{{ user.phone }}</div>
          </div>
          <div class="col-md-2">
            <div class="text-muted small">Вік</div>
            <div class="fw-semibold">{{ user.age }} років</div>
          </div>
          <div class="col-md-2">
            <div class="text-muted small">Стать</div>
            <div class="fw-semibold text-capitalize">{{ user.gender }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Місце для вкладеного маршруту /users/:id/edit -->
    <RouterView />
  </div>
</template>
