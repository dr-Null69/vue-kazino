<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="text-center py-5">
    <h1 class="display-1 fw-bold text-primary">404</h1>
    <h3 class="fw-bold mb-3">Сторінку не знайдено</h3>
    <p class="text-muted mb-4">
      Маршрут, за яким ви звернулися, не існує або був переміщений.
    </p>
    <RouterLink to="/" class="btn btn-primary px-4">
      Повернутися на головну
    </RouterLink>
  </div>
</template>
