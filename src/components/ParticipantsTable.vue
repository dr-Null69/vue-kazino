<script setup lang="ts">
import type { Participant, SortKey, SortOrder } from '@/types/participant';
import SearchBar from './SearchBar.vue';
import BaseButton from './BaseButton.vue';

defineProps<{
  participants: Participant[];
  sortKey: SortKey;
  sortOrder: SortOrder;
}>();

const emit = defineEmits<{
  (e: 'sort', key: 'name' | 'dateOfBirth'): void;
  (e: 'filter-by-name', query: string): void;
  (e: 'edit', participant: Participant): void;
  (e: 'delete', participant: Participant): void;
}>();
</script>

<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <div class="mb-3">
        <SearchBar @filter-by-name="emit('filter-by-name', $event)" />
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col">#</th>
              <th
                scope="col"
                class="cursor-pointer"
                @click="emit('sort', 'name')"
              >
                Name
                <i
                  class="bi ms-1"
                  :class="{
                    'bi-sort-alpha-down text-primary': sortKey === 'name' && sortOrder === 'asc',
                    'bi-sort-alpha-up text-primary': sortKey === 'name' && sortOrder === 'desc',
                    'bi-arrow-down-up text-muted opacity-50': sortKey !== 'name'
                  }"
                ></i>
              </th>
              <th
                scope="col"
                class="cursor-pointer"
                @click="emit('sort', 'dateOfBirth')"
              >
                Date of Birth
                <i
                  class="bi ms-1"
                  :class="{
                    'bi-sort-down-alt text-primary': sortKey === 'dateOfBirth' && sortOrder === 'asc',
                    'bi-sort-down text-primary': sortKey === 'dateOfBirth' && sortOrder === 'desc',
                    'bi-arrow-down-up text-muted opacity-50': sortKey !== 'dateOfBirth'
                  }"
                ></i>
              </th>
              <th scope="col">Email</th>
              <th scope="col">Phone number</th>
              <th scope="col" class="text-center">Edit</th>
              <th scope="col" class="text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="participants.length === 0">
              <td colspan="7" class="text-center text-muted py-4">
                Список учасників порожній
              </td>
            </tr>
            <tr v-for="(participant, index) in participants" :key="participant.id">
              <td>{{ index + 1 }}</td>
              <td>{{ participant.name }}</td>
              <td>{{ participant.dateOfBirth }}</td>
              <td>{{ participant.email }}</td>
              <td>{{ participant.phone }}</td>
              <td class="text-center">
                <BaseButton
                  variant="warning"
                  size="sm"
                  @click="emit('edit', participant)"
                >
                  Редагувати дані
                </BaseButton>
              </td>
              <td class="text-center">
                <BaseButton
                  variant="danger"
                  size="sm"
                  @click="emit('delete', participant)"
                >
                  Видалити учасника
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
