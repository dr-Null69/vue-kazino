<script setup lang="ts">
import { computed } from 'vue';
import type { Participant } from '@/types/participant';
import WinnerItem from './WinnerItem.vue';
import BaseButton from './BaseButton.vue';

const props = defineProps<{
  winners: Participant[];
  totalParticipants: number;
}>();

const emit = defineEmits<{
  (e: 'pick-winner'): void;
  (e: 'remove-winner', id: string): void;
}>();

// Кнопка неактивна, якщо: переможців вже 3, список учасників пустий, або всі учасники вже є переможцями
const isNewWinnerDisabled = computed(() => {
  return (
    props.winners.length >= 3 ||
    props.totalParticipants === 0 ||
    props.winners.length >= props.totalParticipants
  );
});
</script>

<template>
  <div class="card shadow-sm mb-4">
    <div class="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
      <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1 border rounded p-2 min-vh-50 bg-light">
        <span v-if="winners.length === 0" class="text-muted small py-1 px-2">
          Winners...
        </span>
        <WinnerItem
          v-for="winner in winners"
          :key="winner.id"
          :winner="winner"
          @remove="emit('remove-winner', $event)"
        />
      </div>

      <BaseButton
        variant="info"
        class="text-white fw-semibold"
        :disabled="isNewWinnerDisabled"
        @click="emit('pick-winner')"
      >
        New winner
      </BaseButton>
    </div>
  </div>
</template>
