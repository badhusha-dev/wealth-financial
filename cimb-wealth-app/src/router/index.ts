import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../pages/DashboardView.vue'
import PortfolioView from '../pages/PortfolioView.vue'
import TransactionsView from '../pages/TransactionsView.vue'
import GoalsView from '../pages/GoalsView.vue'
import ReportsView from '../pages/ReportsView.vue'
import ThreeDVizView from '../pages/3DVizView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: PortfolioView,
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: TransactionsView,
    },
    {
      path: '/goals',
      name: 'goals',
      component: GoalsView,
    },
    {
      path: '/reports',
      name: 'reports',
      component: ReportsView,
    },
    {
      path: '/3d-viz',
      name: '3d-viz',
      component: ThreeDVizView,
    }
  ],
})

export default router