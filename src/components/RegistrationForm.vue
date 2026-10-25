<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import type { Participant } from '@/types/participant';
import { validateParticipantForm } from '@/utils/validation';
import BaseInput from './BaseInput.vue';
import BaseButton from './BaseButton.vue';

const props = defineProps<{
  participants: Participant[];
}>();

const emit = defineEmits<{
  (e: 'add-participant', participant: Omit<Participant, 'id'>): void;
}>();

const formData = reactive({
  name: '',
  dateOfBirth: '',
  email: '',
  phone: ''
});

// Прапорець показу валідації (щоб при очищенні форми помилки не вискакували)
const isSubmitted = ref(false);

const errors = computed(() => {
  if (!isSubmitted.value) return {};
  return validateParticipantForm(formData, props.participants);
});

function handleSubmit() {
  isSubmitted.value = true;
  const currentErrors = validateParticipantForm(formData, props.participants);

  if (Object.keys(currentErrors).length > 0) {
    return;
  }

  emit('add-participant', {
    name: formData.name.trim(),
    dateOfBirth: formData.dateOfBirth,
    email: formData.email.trim(),
    phone: formData.phone.trim()
  });

  // Очищуємо форму та вимикаємо прапорець валідації
  isSubmitted.value = false;
  formData.name = '';
  formData.dateOfBirth = '';
  formData.email = '';
  formData.phone = '';
}
</script>

<template>
  <div class="card shadow-sm mb-4">
    <div class="card-body">
      <h5 class="card-title fw-bold mb-1">REGISTER FORM</h5>
      <p class="text-muted small mb-3">Please fill in all the fields.</p>

      <form @submit.prevent="handleSubmit" @keydown.enter.prevent="handleSubmit" novalidate>
        <BaseInput
          id="reg-name"
          v-model="formData.name"
          label="Name"
          placeholder="Enter user name"
          :error="errors.name"
          :is-validated="isSubmitted"
        />

        <BaseInput
          id="reg-dob"
          v-model="formData.dateOfBirth"
          type="date"
          label="Date of Birth"
          :error="errors.dateOfBirth"
          :is-validated="isSubmitted"
        />

        <BaseInput
          id="reg-email"
          v-model="formData.email"
          type="email"
          label="Email"
          placeholder="Enter email"
          :error="errors.email"
          :is-validated="isSubmitted"
        />

        <BaseInput
          id="reg-phone"
          v-model="formData.phone"
          type="tel"
          label="Phone number"
          placeholder="+380XXXXXXXXX"
          :error="errors.phone"
          :is-validated="isSubmitted"
        />

        <div class="d-flex justify-content-end mt-3">
          <BaseButton type="submit" variant="info" class="text-white px-4">
            Save
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>
