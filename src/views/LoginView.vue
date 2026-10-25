<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const schema = yup.object({
  username: yup.string().required("Логін є обов'язковим полем"),
  password: yup
    .string()
    .required("Пароль є обов'язковим полем")
    .min(6, 'Пароль має містити щонайменше 6 символів')
});

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: {
    username: 'emilys',
    password: 'emilyspass'
  }
});

const { value: username, errorMessage: usernameError } = useField<string>('username');
const { value: password, errorMessage: passwordError } = useField<string>('password');

const onSubmit = handleSubmit(async (values) => {
  try {
    await authStore.login({
      username: values.username,
      password: values.password
    });
    const redirectPath = (route.query.redirect as string) || '/users';
    router.push(redirectPath);
  } catch {
    // Помилка вже збережена в authStore.error і виводиться у формі
  }
});
</script>

<template>
  <div class="card shadow border-0">
    <div class="card-body p-4">
      <h4 class="fw-bold text-center mb-1">Вхід у систему</h4>
      <p class="text-muted text-center small mb-4">
        Тестовий доступ: <code>emilys</code> / <code>emilyspass</code>
      </p>

      <div v-if="authStore.error" class="alert alert-danger py-2 small" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-1"></i>
        {{ authStore.error }}
      </div>

      <form @submit.prevent="onSubmit" novalidate>
        <div class="mb-3">
          <label for="username" class="form-label fw-semibold">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': usernameError }"
            placeholder="Введіть username"
          />
          <div v-if="usernameError" class="invalid-feedback">{{ usernameError }}</div>
        </div>

        <div class="mb-3">
          <label for="password" class="form-label fw-semibold">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': passwordError }"
            placeholder="Введіть пароль"
          />
          <div v-if="passwordError" class="invalid-feedback">{{ passwordError }}</div>
        </div>

        <button
          type="submit"
          class="btn btn-primary w-100 mt-2"
          :disabled="authStore.isLoading"
        >
          <span v-if="authStore.isLoading" class="spinner-border spinner-border-sm me-2"></span>
          Увійти
        </button>
      </form>
    </div>
  </div>
</template>
