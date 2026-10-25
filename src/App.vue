<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
const authStore = useAuthStore();

const layoutComponent = computed(() => {
  return route.meta.layout === 'auth' ? AuthLayout : DefaultLayout;
});

onMounted(() => {
  if (authStore.isAuthenticated) {
    authStore.fetchCurrentUser();
  }
});
</script>

<template>
  <component :is="layoutComponent">
    <RouterView />
  </component>
</template>
