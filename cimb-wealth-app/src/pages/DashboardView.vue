<template>
  <div class="container-fluid p-4">
    <!-- Welcome Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h2 mb-1">Welcome back, {{ authStore.currentUser?.firstName }}!</h1>
            <p class="text-muted mb-0">Here's your financial overview for today</p>
          </div>
          <div class="text-end">
            <small class="text-muted">Last updated: {{ new Date().toLocaleDateString() }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card bg-primary text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Net Worth</h6>
                <h4 class="mb-0">{{ formatCurrency(portfolioStore.totalPortfolioValue) }}</h4>
              </div>
              <i class="fas fa-chart-line fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card bg-success text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Total Gains</h6>
                <h4 class="mb-0">{{ formatCurrency(portfolioStore.totalUnrealizedGain) }}</h4>
                <small class="opacity-75">{{ formatPercentage(portfolioStore.totalUnrealizedGainPercent) }}</small>
              </div>
              <i class="fas fa-arrow-up fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card bg-info text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Active Goals</h6>
                <h4 class="mb-0">{{ goalsStore.activeGoals.length }}</h4>
                <small class="opacity-75">{{ formatPercentage(goalsStore.overallProgress) }} complete</small>
              </div>
              <i class="fas fa-bullseye fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card bg-warning text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Monthly Income</h6>
                <h4 class="mb-0">{{ formatCurrency(transactionsStore.totalIncome / 12) }}</h4>
                <small class="opacity-75">Avg per month</small>
              </div>
              <i class="fas fa-dollar-sign fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3D Wealth Visualization -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-transparent border-bottom-0">
            <h5 class="card-title mb-0">
              <i class="fas fa-cube text-primary me-2"></i>
              3D Wealth Visualization
            </h5>
          </div>
          <div class="card-body">
            <ThreeVisualization :height="400" :auto-update="true" />
            <p class="text-muted mt-3 mb-0">Interactive 3D visualization of your portfolio allocation and performance metrics.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="row">
      <div class="col-lg-8 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Recent Transactions</h5>
            <router-link to="/transactions" class="btn btn-sm btn-outline-primary">
              View All
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="transactionsStore.loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="transactionsStore.recentTransactions.length === 0" class="text-center py-4 text-muted">
              <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
              <p>No recent transactions</p>
            </div>
            <div v-else>
              <div 
                v-for="transaction in transactionsStore.recentTransactions.slice(0, 5)" 
                :key="transaction.id"
                class="d-flex justify-content-between align-items-center py-2 border-bottom"
              >
                <div class="d-flex align-items-center">
                  <div 
                    class="icon-circle me-3"
                    :class="{
                      'bg-success': transaction.type === 'credit',
                      'bg-danger': transaction.type === 'debit',
                      'bg-secondary': transaction.type === 'neutral'
                    }"
                  >
                    <i :class="{
                      'fas fa-arrow-down text-white': transaction.type === 'credit',
                      'fas fa-arrow-up text-white': transaction.type === 'debit',
                      'fas fa-exchange-alt text-white': transaction.type === 'neutral'
                    }"></i>
                  </div>
                  <div>
                    <div class="fw-medium">{{ transaction.description }}</div>
                    <small class="text-muted">{{ transaction.category }} • {{ transaction.date }}</small>
                  </div>
                </div>
                <div class="text-end">
                  <div 
                    class="fw-bold"
                    :class="{
                      'text-success': transaction.type === 'credit',
                      'text-danger': transaction.type === 'debit',
                      'text-secondary': transaction.type === 'neutral'
                    }"
                  >
                    {{ transaction.type === 'debit' ? '-' : '+' }}{{ formatCurrency(Math.abs(transaction.amount)) }}
                  </div>
                  <small class="text-muted">{{ transaction.currency }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Goal Progress</h5>
            <router-link to="/goals" class="btn btn-sm btn-outline-primary">
              View All
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="goalsStore.loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="goalsStore.activeGoals.length === 0" class="text-center py-4 text-muted">
              <i class="fas fa-bullseye fa-3x mb-3 opacity-50"></i>
              <p>No active goals</p>
            </div>
            <div v-else>
              <div 
                v-for="goal in goalsStore.activeGoals.slice(0, 3)" 
                :key="goal.id"
                class="mb-4"
              >
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="fw-medium">{{ goal.title }}</div>
                  <small class="text-muted">{{ formatPercentage(goal.progressPercentage) }}</small>
                </div>
                <div class="progress" style="height: 8px;">
                  <div 
                    class="progress-bar"
                    :class="{
                      'bg-success': goal.progressPercentage >= 75,
                      'bg-warning': goal.progressPercentage >= 50 && goal.progressPercentage < 75,
                      'bg-primary': goal.progressPercentage < 50
                    }"
                    :style="{ width: Math.min(goal.progressPercentage, 100) + '%' }"
                  ></div>
                </div>
                <div class="d-flex justify-content-between mt-1">
                  <small class="text-muted">{{ formatCurrency(goal.currentAmount) }}</small>
                  <small class="text-muted">{{ formatCurrency(goal.targetAmount) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePortfolioStore } from '@/stores/portfolio'
import { useTransactionsStore } from '@/stores/transactions'
import { useGoalsStore } from '@/stores/goals'
import ThreeVisualization from '@/components/charts/ThreeVisualization.vue'

const authStore = useAuthStore()
const portfolioStore = usePortfolioStore()
const transactionsStore = useTransactionsStore()
const goalsStore = useGoalsStore()

// Initialize auth from localStorage
onMounted(async () => {
  authStore.initializeAuth()
  
  // Load all data when user is authenticated
  if (authStore.isAuthenticated) {
    await Promise.all([
      portfolioStore.loadPortfolio(),
      transactionsStore.loadTransactions(),
      goalsStore.loadGoals()
    ])
  }
})

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100)
}
</script>

<style scoped>
.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.progress {
  border-radius: 10px;
}

.progress-bar {
  border-radius: 10px;
}

.card {
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
</style>