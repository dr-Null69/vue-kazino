<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
</script>

<template>
  <div class="min-vh-100 d-flex flex-column bg-light">
    <AppHeader />
    <main class="container flex-grow-1 pb-5">
      <slot />
    </main>
  </div>
</template>
