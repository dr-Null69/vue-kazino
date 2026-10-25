<script setup lang="ts">
import AppLogo from '@/components/AppLogo.vue';
</script>

<template>
  <div class="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light p-3">
    <div class="mb-4">
      <AppLogo />
    </div>
    <div class="w-100" style="max-width: 440px;">
      <slot />
    </div>
  </div>
</template>
