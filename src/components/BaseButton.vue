<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'danger' | 'info' | 'warning' | 'success';
    disabled?: boolean;
    size?: 'sm' | 'lg' | '';
  }>(),
  {
    type: 'button',
    variant: 'primary',
    disabled: false,
    size: ''
  }
);

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn-${variant}`, size ? `btn-${size}` : '']"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <slot />
  </button>
</template>
