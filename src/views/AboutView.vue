<script setup lang="ts">
const skills = [
  'HTML5 / CSS3 / SCSS',
  'JavaScript (ES6+) / TypeScript',
  'Vue.js 3 (Composition API)',
  'Vue Router & Pinia',
  'REST API / Fetch / JWT Auth',
  'Repository Design Pattern',
  'VeeValidate & Yup',
  'Git / GitHub / Vite'
];
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="card shadow-sm border-0">
        <div class="card-body p-4 p-md-5">
          <div class="d-flex align-items-center gap-3 mb-4">
            <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3" style="width: 64px; height: 64px;">
              ІП
            </div>
            <div>
              <h2 class="fw-bold mb-1">Іванов Іван Іванович</h2>
              <p class="text-muted mb-0">Студент / Frontend Developer</p>
            </div>
          </div>

          <hr />

          <h5 class="fw-bold mt-4 mb-3">Technical Skills</h5>
          <div class="d-flex flex-wrap gap-2 mb-4">
            <span
              v-for="skill in skills"
              :key="skill"
              class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fs-6"
            >
              {{ skill }}
            </span>
          </div>

          <h5 class="fw-bold mb-3">Контакти та профілі</h5>
          <a
            href="https://github.com/dr-Null69"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-dark"
          >
            <i class="bi bi-github me-2"></i>Мій GitHub Профіль
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
