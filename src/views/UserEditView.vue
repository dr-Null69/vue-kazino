<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { useUsersStore } from '@/stores/users.store';
import type { Gender } from '@/types/user';

const props = defineProps<{
  id: string;
}>();

const router = useRouter();
const usersStore = useUsersStore();
const loadError = ref<string | null>(null);

const editSchema = yup.object({
  firstName: yup.string().required("Ім'я є обов'язковим"),
  lastName: yup.string().required("Прізвище є обов'язковим"),
  email: yup.string().required("Email є обов'язковим").email('Невірний формат email'),
  username: yup.string().required("Username є обов'язковим").min(3, 'Мінімум 3 символи'),
  password: yup.string().required("Пароль є обов'язковим").min(6, 'Мінімум 6 символів'),
  age: yup.number().typeError('Введіть число').required("Вік є обов'язковим").min(14, 'Мінімум 14 років'),
  gender: yup.mixed<Gender>().oneOf(['male', 'female', 'other']).required("Оберіть стать"),
  phone: yup.string().required("Телефон є обов'язковим")
});

const { handleSubmit, setValues } = useForm({
  validationSchema: editSchema
});

const { value: firstName, errorMessage: firstNameError } = useField<string>('firstName');
const { value: lastName, errorMessage: lastNameError } = useField<string>('lastName');
const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: username, errorMessage: usernameError } = useField<string>('username');
const { value: password, errorMessage: passwordError } = useField<string>('password');
const { value: age, errorMessage: ageError } = useField<number>('age');
const { value: gender, errorMessage: genderError } = useField<Gender>('gender');
const { value: phone, errorMessage: phoneError } = useField<string>('phone');

onMounted(async () => {
  try {
    const user = await usersStore.getUserById(Number(props.id));
    setValues({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      password: user.password || 'password123',
      age: user.age,
      gender: (user.gender as Gender) || 'male',
      phone: user.phone
    });
  } catch (e) {
    loadError.value = (e as Error).message;
  }
});

const onUpdate = handleSubmit(async (values) => {
  await usersStore.updateUser(Number(props.id), values);
  router.push({ name: 'user-details', params: { id: props.id } });
});
</script>

<template>
  <div class="card shadow-sm border-warning border-2">
    <div class="card-body p-4">
      <h5 class="fw-bold mb-3">Редагування даних користувача #{{ id }}</h5>

      <div v-if="loadError" class="alert alert-danger">{{ loadError }}</div>

      <form v-else @submit.prevent="onUpdate" novalidate>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold">Ім'я (firstName)</label>
            <input v-model="firstName" type="text" class="form-control" :class="{ 'is-invalid': firstNameError }" />
            <div class="invalid-feedback">{{ firstNameError }}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Прізвище (lastName)</label>
            <input v-model="lastName" type="text" class="form-control" :class="{ 'is-invalid': lastNameError }" />
            <div class="invalid-feedback">{{ lastNameError }}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Email</label>
            <input v-model="email" type="email" class="form-control" :class="{ 'is-invalid': emailError }" />
            <div class="invalid-feedback">{{ emailError }}</div>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Телефон (phone)</label>
            <input v-model="phone" type="tel" class="form-control" :class="{ 'is-invalid': phoneError }" />
            <div class="invalid-feedback">{{ phoneError }}</div>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Username</label>
            <input v-model="username" type="text" class="form-control" :class="{ 'is-invalid': usernameError }" />
            <div class="invalid-feedback">{{ usernameError }}</div>
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Пароль (password)</label>
            <input v-model="password" type="password" class="form-control" :class="{ 'is-invalid': passwordError }" />
            <div class="invalid-feedback">{{ passwordError }}</div>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold">Вік (age)</label>
            <input v-model="age" type="number" class="form-control" :class="{ 'is-invalid': ageError }" />
            <div class="invalid-feedback">{{ ageError }}</div>
          </div>
          <div class="col-md-2">
            <label class="form-label fw-semibold">Стать (gender)</label>
            <select v-model="gender" class="form-select" :class="{ 'is-invalid': genderError }">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <div class="invalid-feedback">{{ genderError }}</div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            class="btn btn-secondary"
            @click="router.push({ name: 'user-details', params: { id } })"
          >
            Скасувати
          </button>
          <button type="submit" class="btn btn-primary" :disabled="usersStore.isLoading">
            Оновити дані
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
