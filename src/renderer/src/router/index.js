import { createRouter, createWebHistory } from 'vue-router'
import layout from '../components/layout/index.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: layout
    }
  ]
})

export default router
