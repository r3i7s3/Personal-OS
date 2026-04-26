import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/today'
  },
  {
    path: '/today',
    name: 'Today',
    component: () => import('../views/TodayView.vue')
  },
  {
    path: '/todo',
    name: 'Todo',
    component: () => import('../views/TodoView.vue')
  },
  {
    path: '/journal',
    name: 'Journal',
    component: () => import('../views/JournalView.vue')
  },
  {
    path: '/project',
    name: 'Project',
    component: () => import('../views/ProjectView.vue')
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: () => import('../views/TimelineView.vue')
  },
  {
    path: '/health',
    name: 'Health',
    component: () => import('../views/HealthView.vue')
  },
  {
    path: '/assets',
    name: 'Assets',
    component: () => import('../views/AssetsView.vue')
  },
  {
    path: '/ai',
    name: 'Ai',
    component: () => import('../views/AiView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue')
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
