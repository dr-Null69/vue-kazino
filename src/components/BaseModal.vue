<script setup lang="ts">
import { watch, ref, nextTick } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  title: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const modalRef = ref<HTMLElement | null>(null);

watch(
  () => props.isOpen,
  async (val) => {
    if (val) {
      await nextTick();
      modalRef.value?.focus();
    }
  }
);
</script>

<template>
  <div v-if="isOpen">
    <div class="modal-backdrop fade show"></div>
    <div
      ref="modalRef"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      @keydown.esc="emit('close')"
      @click.self="emit('close')"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="emit('close')"
            ></button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
