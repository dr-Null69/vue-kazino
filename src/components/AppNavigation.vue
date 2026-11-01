<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();

function handleLogout() {
  authStore.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <nav class="d-flex align-items-center gap-3">
    <ul class="navbar-nav flex-row gap-3 me-3">
      <li class="nav-item">
        <RouterLink
          to="/"
          class="nav-link px-2"
          active-class="active fw-bold text-primary border-bottom border-primary border-2"
        >
          Home
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink
          to="/about"
          class="nav-link px-2"
          active-class="active fw-bold text-primary border-bottom border-primary border-2"
        >
          About author
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink
          to="/users"
          class="nav-link px-2"
          active-class="active fw-bold text-primary border-bottom border-primary border-2"
        >
          Users
        </RouterLink>
      </li>
    </ul>

    <div class="d-flex align-items-center gap-2">
      <span v-if="authStore.isAuthenticated && authStore.user" class="text-muted small d-none d-md-inline">
        Привіт, <strong>{{ authStore.user.firstName }}</strong>
      </span>

      <button
        v-if="authStore.isAuthenticated"
        type="button"
        class="btn btn-outline-danger btn-sm"
        @click="handleLogout"
      >
        Logout
      </button>

      <RouterLink
        v-else
        to="/login"
        class="btn btn-primary btn-sm"
        active-class="active"
      >
        Login
      </RouterLink>
    </div>
  </nav>
</template>
