<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import type { Participant, SortKey, SortOrder } from '@/types/participant';
import { validateParticipantForm } from '@/utils/validation';

import WinnersBlock from '@/components/WinnersBlock.vue';
import RegistrationForm from '@/components/RegistrationForm.vue';
import ParticipantsTable from '@/components/ParticipantsTable.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';

const STORAGE_KEY = 'vue-lottery-participants';

// Стан учасників та переможців
const participants = ref<Participant[]>([]);
const winners = ref<Participant[]>([]);

// Стан фільтрації та сортування
const searchQuery = ref('');
const sortKey = ref<SortKey>(null);
const sortOrder = ref<SortOrder>('asc');

// Відновлення даних з localStorage при завантаженні застосунку
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      participants.value = JSON.parse(saved);
    } catch {
      participants.value = [];
    }
  }
});

// Збереження юзерів у localStorage через watcher з опцією deep
watch(
  participants,
  (newList) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  },
  { deep: true }
);

// Додавання нового учасника
function addParticipant(data: Omit<Participant, 'id'>) {
  participants.value.push({
    id: crypto.randomUUID(),
    ...data
  });
}

// Випадковий вибір переможця (один учасник не може бути переможцем двічі)
function pickRandomWinner() {
  if (winners.value.length >= 3) return;

  const winnerIds = new Set(winners.value.map((w) => w.id));
  const availableCandidates = participants.value.filter((p) => !winnerIds.has(p.id));

  if (availableCandidates.length === 0) return;

  const randomIndex = Math.floor(Math.random() * availableCandidates.length);
  winners.value.push(availableCandidates[randomIndex]);
}

// Видалення переможця з блоку переможців
function removeWinner(id: string) {
  winners.value = winners.value.filter((w) => w.id !== id);
}

// Логіка перемикання сортування
function handleSort(key: 'name' | 'dateOfBirth') {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
}

// Спільна робота фільтрації та сортування (спочатку фільтрується, потім сортується, не змінюючи оригінал)
const filteredAndSortedParticipants = computed(() => {
  let result = [...participants.value];

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(query));
  }

  if (sortKey.value) {
    const key = sortKey.value;
    const modifier = sortOrder.value === 'asc' ? 1 : -1;

    result.sort((a, b) => {
      if (key === 'name') {
        return a.name.localeCompare(b.name) * modifier;
      }
      if (key === 'dateOfBirth') {
        return a.dateOfBirth.localeCompare(b.dateOfBirth) * modifier;
      }
      return 0;
    });
  }

  return result;
});

// ================= МОДАЛЬНЕ ВІКНО РЕДАГУВАННЯ =================
const isEditModalOpen = ref(false);
const editingParticipantId = ref<string | null>(null);
const isEditSubmitted = ref(false);

const editFormData = reactive({
  name: '',
  dateOfBirth: '',
  email: '',
  phone: ''
});

const editErrors = computed(() => {
  if (!isEditSubmitted.value || !editingParticipantId.value) return {};
  return validateParticipantForm(
    editFormData,
    participants.value,
    editingParticipantId.value
  );
});

function openEditModal(participant: Participant) {
  editingParticipantId.value = participant.id;
  editFormData.name = participant.name;
  editFormData.dateOfBirth = participant.dateOfBirth;
  editFormData.email = participant.email;
  editFormData.phone = participant.phone;
  isEditSubmitted.value = false;
  isEditModalOpen.value = true;
}

function closeEditModal() {
  isEditModalOpen.value = false;
  editingParticipantId.value = null;
}

function handleUpdateParticipant() {
  if (!editingParticipantId.value) return;
  isEditSubmitted.value = true;

  const currentErrors = validateParticipantForm(
    editFormData,
    participants.value,
    editingParticipantId.value
  );

  if (Object.keys(currentErrors).length > 0) return;

  const index = participants.value.findIndex((p) => p.id === editingParticipantId.value);
  if (index !== -1) {
    const updated: Participant = {
      id: editingParticipantId.value,
      name: editFormData.name.trim(),
      dateOfBirth: editFormData.dateOfBirth,
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim()
    };
    participants.value[index] = updated;

    // Оновлюємо дані також у списку переможців, якщо цей учасник вже виграв
    const winnerIndex = winners.value.findIndex((w) => w.id === updated.id);
    if (winnerIndex !== -1) {
      winners.value[winnerIndex] = updated;
    }
  }

  closeEditModal();
}

// ================= МОДАЛЬНЕ ВІКНО ВИДАЛЕННЯ =================
const isDeleteModalOpen = ref(false);
const participantToDelete = ref<Participant | null>(null);

function openDeleteModal(participant: Participant) {
  participantToDelete.value = participant;
  isDeleteModalOpen.value = true;
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false;
  participantToDelete.value = null;
}

function confirmDeleteParticipant() {
  if (!participantToDelete.value) return;
  const targetId = participantToDelete.value.id;

  participants.value = participants.value.filter((p) => p.id !== targetId);
  // Якщо видаляється учасник, який є переможцем, він видаляється і з блоку переможців
  winners.value = winners.value.filter((w) => w.id !== targetId);

  closeDeleteModal();
}
</script>

<template>
  <div class="container mt-4" style="max-width: 960px;">
    <!-- 1. Блок переможців -->
    <WinnersBlock
      :winners="winners"
      :total-participants="participants.length"
      @pick-winner="pickRandomWinner"
      @remove-winner="removeWinner"
    />

    <!-- 2. Блок з формою реєстрації -->
    <RegistrationForm
      :participants="participants"
      @add-participant="addParticipant"
    />

    <!-- 3. Блок з таблицею учасників -->
    <ParticipantsTable
      :participants="filteredAndSortedParticipants"
      :sort-key="sortKey"
      :sort-order="sortOrder"
      @sort="handleSort"
      @filter-by-name="searchQuery = $event"
      @edit="openEditModal"
      @delete="openDeleteModal"
    />

    <!-- Модальне вікно редагування учасника -->
    <BaseModal
      :is-open="isEditModalOpen"
      title="Редагувати дані учасника"
      @close="closeEditModal"
    >
      <form @submit.prevent="handleUpdateParticipant" novalidate>
        <BaseInput
          id="edit-name"
          v-model="editFormData.name"
          label="Name"
          :error="editErrors.name"
          :is-validated="isEditSubmitted"
        />
        <BaseInput
          id="edit-dob"
          v-model="editFormData.dateOfBirth"
          type="date"
          label="Date of Birth"
          :error="editErrors.dateOfBirth"
          :is-validated="isEditSubmitted"
        />
        <BaseInput
          id="edit-email"
          v-model="editFormData.email"
          type="email"
          label="Email"
          :error="editErrors.email"
          :is-validated="isEditSubmitted"
        />
        <BaseInput
          id="edit-phone"
          v-model="editFormData.phone"
          type="tel"
          label="Phone number"
          :error="editErrors.phone"
          :is-validated="isEditSubmitted"
        />
        <div class="d-flex justify-content-end gap-2 mt-4">
          <BaseButton variant="secondary" @click="closeEditModal">
            Скасувати
          </BaseButton>
          <BaseButton type="submit" variant="primary">
            Оновити дані
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Модальне вікно підтвердження видалення -->
    <BaseModal
      :is-open="isDeleteModalOpen"
      title="Підтвердження видалення"
      @close="closeDeleteModal"
    >
      <p v-if="participantToDelete" class="mb-0">
        Ви дійсно бажаєте видалити учасника "{{ participantToDelete.name }}", "{{ participantToDelete.email }}"?
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="closeDeleteModal">
          Ні
        </BaseButton>
        <BaseButton variant="danger" @click="confirmDeleteParticipant">
          Так
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
