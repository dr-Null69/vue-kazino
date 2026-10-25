import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
    layout?: 'default' | 'auth';
  }
}

const router = createRouter({
  // Використовуємо createWebHashHistory або createWebHistory(import.meta.env.BASE_URL)
  // HashHistory гарантує безпомилкове оновлення сторінок на GitHub Pages
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Головна | Vue Lottery', layout: 'default' }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { title: 'Про автора | Vue Lottery', layout: 'default' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: 'Вхід | Vue Lottery', layout: 'auth' }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
      meta: { title: 'Користувачі | Vue Lottery', requiresAuth: true, layout: 'default' }
    },
    {
      path: '/users/:id',
      name: 'user-details',
      component: () => import('@/views/UserDetailsView.vue'),
      props: true,
      meta: { title: 'Профіль користувача | Vue Lottery', requiresAuth: true, layout: 'default' },
      children: [
        {
          path: 'edit',
          name: 'user-edit',
          component: () => import('@/views/UserEditView.vue'),
          props: true,
          meta: { title: 'Редагування користувача | Vue Lottery', requiresAuth: true, layout: 'default' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: '404 Не знайдено | Vue Lottery', layout: 'default' }
    }
  ]
});

// Навігаційний guard для захисту маршрутів
router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath }
    };
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'users' };
  }
});

// Динамічна зміна заголовка вкладки браузера
router.afterEach((to) => {
  document.title = to.meta.title || 'Vue Lottery App';
});

export default router;
