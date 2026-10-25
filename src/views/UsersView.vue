<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { useUsersStore } from '@/stores/users.store';
import type { User, Gender } from '@/types/user';
import BaseModal from '@/components/BaseModal.vue';

const route = useRoute();
const router = useRouter();
const usersStore = useUsersStore();

const LIMIT = 10;

// Читаємо поточну сторінку та пошуковий запит із URL query
const currentPage = computed(() => {
  const page = Number(route.query.page);
  return page > 0 ? page : 1;
});

const searchQuery = computed(() => (route.query.q as string) || '');
const searchInput = ref(searchQuery.value);

const totalPages = computed(() => Math.max(1, Math.ceil(usersStore.total / LIMIT)));

// Завантаження даних при зміні query-параметрів URL
watch(
  [currentPage, searchQuery],
  ([page, q]) => {
    searchInput.value = q;
    const skip = (page - 1) * LIMIT;
    usersStore.fetchUsers({ limit: LIMIT, skip, q });
  },
  { immediate: true }
);

// Пошук із debounce 300ms та записом у URL query
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    router.push({
      name: 'users',
      query: {
        ...(searchInput.value.trim() ? { q: searchInput.value.trim() } : {}),
        page: 1
      }
    });
  }, 300);
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  router.push({
    name: 'users',
    query: {
      ...(searchQuery.value ? { q: searchQuery.value } : {}),
      page
    }
  });
}

// Валідація форми створення користувача через VeeValidate + Yup
const createSchema = yup.object({
  firstName: yup.string().required("Ім'я є обов'язковим"),
  lastName: yup.string().required("Прізвище є обов'язковим"),
  email: yup.string().required("Email є обов'язковим").email('Невірний формат email'),
  username: yup.string().required("Username є обов'язковим").min(3, 'Мінімум 3 символи'),
  password: yup.string().required("Пароль є обов'язковим").min(6, 'Мінімум 6 символів'),
  age: yup
    .number()
    .typeError('Введіть число')
    .required("Вік є обов'язковим")
    .min(14, 'Мінімальний вік 14 років')
    .max(120, 'Некоректний вік'),
  gender: yup.mixed<Gender>().oneOf(['male', 'female', 'other']).required("Оберіть стать"),
  phone: yup.string().required("Телефон є обов'язковим")
});

const { handleSubmit, resetForm } = useForm({
  validationSchema: createSchema,
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    age: 20,
    gender: 'male' as Gender,
    phone: '+380'
  }
});

const { value: firstName, errorMessage: firstNameError } = useField<string>('firstName');
const { value: lastName, errorMessage: lastNameError } = useField<string>('lastName');
const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: username, errorMessage: usernameError } = useField<string>('username');
const { value: password, errorMessage: passwordError } = useField<string>('password');
const { value: age, errorMessage: ageError } = useField<number>('age');
const { value: gender, errorMessage: genderError } = useField<Gender>('gender');
const { value: phone, errorMessage: phoneError } = useField<string>('phone');

const showCreateForm = ref(false);

const onCreateUser = handleSubmit(async (values) => {
  await usersStore.createUser(values);
  resetForm();
  showCreateForm.value = false;
});

// Видалення користувача через модальне вікно
const userToDelete = ref<User | null>(null);
const isDeleteModalOpen = ref(false);

function confirmDelete(user: User) {
  userToDelete.value = user;
  isDeleteModalOpen.value = true;
}

async function handleDelete() {
  if (!userToDelete.value) return;
  await usersStore.deleteUser(userToDelete.value.id);
  isDeleteModalOpen.value = false;
  userToDelete.value = null;
}
</script>

<template>
  <div>
    <!-- Блок переможців лотереї -->
    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1 border rounded p-2 bg-light">
          <span v-if="usersStore.winners.length === 0" class="text-muted small px-2">
            Переможці лотереї (до 3 учасників)...
          </span>
          <span
            v-for="winner in usersStore.winners"
            :key="winner.id"
            class="badge bg-info text-dark d-inline-flex align-items-center gap-2 p-2 fs-6"
          >
            {{ winner.firstName }} {{ winner.lastName }}
            <button
              type="button"
              class="btn-close"
              style="font-size: 0.65rem;"
              @click="usersStore.removeWinner(winner.id)"
            ></button>
          </span>
        </div>
        <button
          type="button"
          class="btn btn-info text-white fw-semibold"
          :disabled="usersStore.winners.length >= 3 || usersStore.users.length === 0"
          @click="usersStore.pickWinner()"
        >
          New winner
        </button>
      </div>
    </div>

    <!-- Кнопка розгортання форми створення -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0">Список учасників (DummyJSON Users)</h4>
      <button
        type="button"
        class="btn btn-primary"
        @click="showCreateForm = !showCreateForm"
      >
        <i class="bi me-1" :class="showCreateForm ? 'bi-dash-lg' : 'bi-plus-lg'"></i>
        {{ showCreateForm ? 'Приховати форму' : 'Додати користувача' }}
      </button>
    </div>

    <!-- Форма створення нового користувача -->
    <div v-if="showCreateForm" class="card shadow-sm border-0 mb-4">
      <div class="card-body p-4">
        <h5 class="fw-bold mb-3">Новий учасник</h5>
        <form @submit.prevent="onCreateUser" novalidate>
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
            <button type="button" class="btn btn-secondary" @click="showCreateForm = false">Скасувати</button>
            <button type="submit" class="btn btn-success" :disabled="usersStore.isLoading">Зберегти</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Таблиця учасників та пошук -->
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <div class="mb-3">
          <div class="input-group">
            <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
            <input
              v-model="searchInput"
              type="text"
              class="form-control"
              placeholder="Пошук користувачів (зберігається в URL ?q=...)..."
              @input="onSearchInput"
            />
          </div>
        </div>

        <!-- Стан помилки -->
        <div v-if="usersStore.error" class="alert alert-danger">
          {{ usersStore.error }}
        </div>

        <!-- Стан завантаження -->
        <div v-if="usersStore.isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-2 mb-0">Завантаження даних з API...</p>
        </div>

        <!-- Таблиця -->
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Ім'я та Прізвище</th>
                <th>Username</th>
                <th>Вік / Стать</th>
                <th>Email</th>
                <th>Телефон</th>
                <th class="text-center">Дії</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="usersStore.users.length === 0">
                <td colspan="7" class="text-center text-muted py-4">Користувачів не знайдено</td>
              </tr>
              <tr v-for="user in usersStore.users" :key="user.id">
                <td>{{ user.id }}</td>
                <td class="fw-semibold">{{ user.firstName }} {{ user.lastName }}</td>
                <td><span class="badge bg-secondary">{{ user.username }}</span></td>
                <td>{{ user.age }} р. ({{ user.gender }})</td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone }}</td>
                <td class="text-center">
                  <div class="d-inline-flex gap-1">
                    <RouterLink
                      :to="{ name: 'user-details', params: { id: user.id } }"
                      class="btn btn-sm btn-outline-primary"
                    >
                      Деталі
                    </RouterLink>
                    <RouterLink
                      :to="{ name: 'user-edit', params: { id: user.id } }"
                      class="btn btn-sm btn-warning"
                    >
                      Редагувати
                    </RouterLink>
                    <button
                      type="button"
                      class="btn btn-sm btn-danger"
                      @click="confirmDelete(user)"
                    >
                      Видалити
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Пагінація -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-2 border-top">
          <span class="text-muted small">
            Всього записів: {{ usersStore.total }} | Сторінка {{ currentPage }} з {{ totalPages }}
          </span>
          <div class="btn-group">
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="currentPage <= 1 || usersStore.isLoading"
              @click="goToPage(currentPage - 1)"
            >
              Попередня
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              :disabled="currentPage >= totalPages || usersStore.isLoading"
              @click="goToPage(currentPage + 1)"
            >
              Наступна
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальне вікно видалення -->
    <BaseModal
      :is-open="isDeleteModalOpen"
      title="Підтвердження видалення"
      @close="isDeleteModalOpen = false"
    >
      <p v-if="userToDelete" class="mb-0">
        Ви дійсно бажаєте видалити користувача
        <strong>{{ userToDelete.firstName }} {{ userToDelete.lastName }}</strong> ({{ userToDelete.email }})?
      </p>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="isDeleteModalOpen = false">Ні</button>
        <button type="button" class="btn btn-danger" @click="handleDelete">Так, видалити</button>
      </template>
    </BaseModal>
  </div>
</template>
