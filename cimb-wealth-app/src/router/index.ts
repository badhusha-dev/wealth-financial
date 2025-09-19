import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../pages/DashboardView.vue'
import LoginView from '../pages/LoginView.vue'
import PortfolioView from '../pages/PortfolioView.vue'
import TransactionsView from '../pages/TransactionsView.vue'
import GoalsView from '../pages/GoalsView.vue'
import ReportsView from '../pages/ReportsView.vue'
import ThreeDVizView from '../pages/3DVizView.vue'
import { requireAuth, redirectIfAuthenticated } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      beforeEnter: redirectIfAuthenticated,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: PortfolioView,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: TransactionsView,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    {
      path: '/goals',
      name: 'goals',
      component: GoalsView,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    },
    {
      path: '/3d-viz',
      name: '3d-viz',
      component: ThreeDVizView,
      beforeEnter: requireAuth,
      meta: { requiresAuth: true }
    }
  ],
})

export default router