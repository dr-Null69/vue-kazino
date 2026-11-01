<script setup lang="ts">
import { ref, watch } from 'vue';

const searchQuery = ref('');

const emit = defineEmits<{
  (e: 'filter-by-name', query: string): void;
}>();

let timeoutId: ReturnType<typeof setTimeout> | null = null;

watch(searchQuery, (newValue) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(() => {
    emit('filter-by-name', newValue.trim());
  }, 300);
});
</script>

<template>
  <div class="input-group">
    <span class="input-group-text bg-white">
      <i class="bi bi-search text-muted"></i>
    </span>
    <input
      v-model="searchQuery"
      type="text"
      class="form-control"
      placeholder="Пошук учасників за іменем..."
    />
  </div>
</template>
