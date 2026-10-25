<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string;
    label: string;
    modelValue: string;
    type?: string;
    placeholder?: string;
    error?: string;
    isValidated?: boolean;
  }>(),
  {
    type: 'text',
    placeholder: '',
    error: '',
    isValidated: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}
</script>

<template>
  <div class="mb-3">
    <label :for="id" class="form-label fw-semibold">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      class="form-control"
      :class="{
        'is-invalid': isValidated && error,
        'is-valid': isValidated && !error && modelValue
      }"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
    />
    <div v-if="isValidated && error" class="invalid-feedback">
      {{ error }}
    </div>
  </div>
</template>
