<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-10">
      <div class="card shadow-sm border-0 mb-4">
        <div class="card-body p-4 p-md-5">
          <h1 class="fw-bold mb-3">Vue Lottery App</h1>
          <p class="lead text-muted mb-4">
            Односторінковий вебзастосунок (SPA) для проведення розіграшів та управління базою учасників.
            У версії Лабораторної роботи №5 реалізовано клієнтську маршрутизацію, архітектурний патерн
            <strong>Repository</strong>, взаємодію з REST API <strong>DummyJSON</strong> та захищену JWT-авторизацію.
          </p>

          <h5 class="fw-bold mb-3">Технології, що використовуються:</h5>
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <ul class="list-group list-group-flush">
                <li class="list-group-item bg-transparent"><i class="bi bi-check2-circle text-success me-2"></i><strong>Vue 3 (Composition API)</strong> + TypeScript</li>
                <li class="list-group-item bg-transparent"><i class="bi bi-check2-circle text-success me-2"></i><strong>Vue Router 4</strong> (Guards, Meta, Lazy Loading, Nested Routes)</li>
                <li class="list-group-item bg-transparent"><i class="bi bi-check2-circle text-success me-2"></i><strong>Pinia</strong> для централізованого керування станом</li>
              </ul>
            </div>
            <div class="col-md-6">
              <ul class="list-group list-group-flush">
                <li class="list-group-item bg-transparent"><i class="bi bi-check2-circle text-success me-2"></i><strong>Repository Pattern</strong> + ServiceProvider</li>
                <li class="list-group-item bg-transparent"><i class="bi bi-check2-circle text-success me-2"></i><strong>VeeValidate + Yup</strong> для декларативної валідації форм</li>
                <li class="list-group-item bg-transparent"><i class="bi bi-check2-circle text-success me-2"></i><strong>Bootstrap 5 (SCSS)</strong> та ESLint</li>
              </ul>
            </div>
          </div>

          <div class="d-flex flex-wrap gap-3">
            <RouterLink to="/users" class="btn btn-primary px-4">
              <i class="bi bi-people-fill me-2"></i>Перейти до учасників
            </RouterLink>
            <a
              href="https://github.com/dr-Null69/vue-kazino"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-outline-dark px-4"
            >
              <i class="bi bi-github me-2"></i>GitHub Репозиторій проєкту
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
