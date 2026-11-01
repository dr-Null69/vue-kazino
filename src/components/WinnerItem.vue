<script setup lang="ts">
import type { Participant } from '@/types/participant';

defineProps<{
  winner: Participant;
}>();

const emit = defineEmits<{
  (e: 'remove', id: string): void;
}>();
</script>

<template>
  <span class="badge bg-info text-dark d-inline-flex align-items-center gap-2 p-2 fs-6">
    <span>{{ winner.name }}</span>
    <button
      type="button"
      class="btn-close btn-close-dark"
      style="font-size: 0.65rem;"
      aria-label="Remove winner"
      @click="emit('remove', winner.id)"
    ></button>
  </span>
</template>
