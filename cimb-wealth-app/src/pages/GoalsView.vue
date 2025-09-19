<template>
  <div class="container-fluid p-4">
    <!-- Page Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h2 mb-1">Financial Goals</h1>
            <p class="text-muted mb-0">Track your progress towards achieving your financial objectives</p>
          </div>
          <div class="text-end">
            <button 
              class="btn btn-outline-primary me-2"
              @click="refreshGoals"
              :disabled="goalsStore.loading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': goalsStore.loading }"></i>
              Refresh
            </button>
            <button class="btn btn-primary">
              <i class="fas fa-plus"></i>
              Add Goal
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overall Progress Summary -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="row">
              <div class="col-lg-3 col-md-6 mb-3 mb-lg-0">
                <div class="d-flex align-items-center">
                  <div class="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                    <i class="fas fa-bullseye text-primary fa-lg"></i>
                  </div>
                  <div>
                    <h6 class="mb-0">Total Goals</h6>
                    <h4 class="mb-0 text-primary">{{ goalsStore.userGoals.length }}</h4>
                    <small class="text-muted">Active goals</small>
                  </div>
                </div>
              </div>
              <div class="col-lg-3 col-md-6 mb-3 mb-lg-0">
                <div class="d-flex align-items-center">
                  <div class="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                    <i class="fas fa-check-circle text-success fa-lg"></i>
                  </div>
                  <div>
                    <h6 class="mb-0">Completed</h6>
                    <h4 class="mb-0 text-success">{{ completedGoalsCount }}</h4>
                    <small class="text-muted">{{ completedPercentage }}% of goals</small>
                  </div>
                </div>
              </div>
              <div class="col-lg-3 col-md-6 mb-3 mb-md-0">
                <div class="d-flex align-items-center">
                  <div class="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                    <i class="fas fa-chart-line text-info fa-lg"></i>
                  </div>
                  <div>
                    <h6 class="mb-0">On Track</h6>
                    <h4 class="mb-0 text-info">{{ onTrackGoalsCount }}</h4>
                    <small class="text-muted">Good progress</small>
                  </div>
                </div>
              </div>
              <div class="col-lg-3 col-md-6">
                <div class="d-flex align-items-center">
                  <div class="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                    <i class="fas fa-clock text-warning fa-lg"></i>
                  </div>
                  <div>
                    <h6 class="mb-0">Behind Schedule</h6>
                    <h4 class="mb-0 text-warning">{{ behindScheduleGoalsCount }}</h4>
                    <small class="text-muted">Need attention</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Goals Filter Tabs -->
    <div class="row mb-4">
      <div class="col-12">
        <ul class="nav nav-pills nav-fill bg-light rounded p-1">
          <li class="nav-item">
            <a class="nav-link" 
               :class="{ active: activeFilter === 'all' }"
               href="#" 
               @click.prevent="setActiveFilter('all')">
              All Goals ({{ goalsStore.userGoals.length }})
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" 
               :class="{ active: activeFilter === 'active' }"
               href="#" 
               @click.prevent="setActiveFilter('active')">
              Active ({{ activeGoalsCount }})
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" 
               :class="{ active: activeFilter === 'completed' }"
               href="#" 
               @click.prevent="setActiveFilter('completed')">
              Completed ({{ completedGoalsCount }})
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" 
               :class="{ active: activeFilter === 'overdue' }"
               href="#" 
               @click.prevent="setActiveFilter('overdue')">
              Overdue ({{ overdueGoalsCount }})
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="goalsStore.loading" class="row">
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted">Loading your financial goals...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredGoals.length === 0" class="row">
      <div class="col-12 text-center py-5">
        <div class="mb-4">
          <i class="fas fa-bullseye fa-4x text-muted opacity-50"></i>
        </div>
        <h4 class="text-muted">No Goals Found</h4>
        <p class="text-muted mb-4">
          {{ activeFilter === 'all' ? 'Start your financial journey by creating your first goal!' : `No ${activeFilter} goals to display.` }}
        </p>
        <button class="btn btn-primary">
          <i class="fas fa-plus me-2"></i>
          Create Your First Goal
        </button>
      </div>
    </div>

    <!-- Goals Grid -->
    <div v-else class="row">
      <div v-for="goal in filteredGoals" :key="goal.id" class="col-lg-6 col-xl-4 mb-4">
        <div class="card h-100 border-0 shadow-sm goal-card" 
             :class="getGoalCardClass(goal)">
          <div class="card-body">
            <!-- Goal Header -->
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="flex-grow-1">
                <h5 class="card-title mb-1">{{ goal.title }}</h5>
                <span class="badge rounded-pill" :class="getCategoryBadgeClass(goal.category)">
                  {{ goal.category }}
                </span>
              </div>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                        type="button" data-bs-toggle="dropdown">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#"><i class="fas fa-edit me-2"></i>Edit</a></li>
                  <li><a class="dropdown-item" href="#"><i class="fas fa-trash me-2"></i>Delete</a></li>
                </ul>
              </div>
            </div>

            <!-- Progress Section -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-medium">Progress</span>
                <span class="badge bg-primary rounded-pill">
                  {{ Math.round(goal.progressPercentage) }}%
                </span>
              </div>
              <div class="progress mb-2" style="height: 8px;">
                <div class="progress-bar" 
                     :class="getProgressBarClass(goal)"
                     :style="{ width: goal.progressPercentage + '%' }"
                     role="progressbar">
                </div>
              </div>
              <div class="d-flex justify-content-between small text-muted">
                <span>{{ formatCurrency(goal.currentAmount, goal.currency) }}</span>
                <span>{{ formatCurrency(goal.targetAmount, goal.currency) }}</span>
              </div>
            </div>

            <!-- Goal Details -->
            <div class="row g-2 mb-3">
              <div class="col-6">
                <div class="small text-muted">Target Date</div>
                <div class="fw-medium">{{ formatDate(goal.targetDate) }}</div>
              </div>
              <div class="col-6">
                <div class="small text-muted">Days Left</div>
                <div class="fw-medium" :class="getDaysLeftClass(goal)">
                  {{ getDaysLeft(goal.targetDate) }}
                </div>
              </div>
              <div class="col-6">
                <div class="small text-muted">Monthly Target</div>
                <div class="fw-medium">{{ formatCurrency(goal.monthlyContribution, goal.currency) }}</div>
              </div>
              <div class="col-6">
                <div class="small text-muted">Priority</div>
                <span class="badge rounded-pill" :class="getPriorityBadgeClass(goal.priority)">
                  {{ goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1) }}
                </span>
              </div>
            </div>

            <!-- Goal Description -->
            <p class="card-text small text-muted mb-3" v-if="goal.description">
              {{ goal.description }}
            </p>

            <!-- Action Buttons -->
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary flex-grow-1">
                <i class="fas fa-plus me-1"></i>
                Add Progress
              </button>
              <button class="btn btn-sm btn-outline-info">
                <i class="fas fa-chart-line"></i>
              </button>
            </div>

            <!-- Goal Status Indicator -->
            <div class="position-absolute top-0 end-0 p-2">
              <i class="fas fa-circle" 
                 :class="getStatusIndicatorClass(goal)"
                 :title="getGoalStatus(goal)">
              </i>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGoalsStore } from '@/stores/goals'

const goalsStore = useGoalsStore()

// Filter state
const activeFilter = ref('all')

// Computed properties for goal statistics
const completedGoalsCount = computed(() => 
  goalsStore.userGoals.filter(goal => goal.progressPercentage >= 100).length
)

const activeGoalsCount = computed(() =>
  goalsStore.userGoals.filter(goal => goal.progressPercentage < 100 && new Date(goal.targetDate) > new Date()).length
)

const overdueGoalsCount = computed(() =>
  goalsStore.userGoals.filter(goal => goal.progressPercentage < 100 && new Date(goal.targetDate) < new Date()).length
)

const onTrackGoalsCount = computed(() =>
  goalsStore.userGoals.filter(goal => {
    if (goal.progressPercentage >= 100) return false
    const timeProgress = getTimeProgress(goal.startDate, goal.targetDate)
    return goal.progressPercentage >= (timeProgress * 0.8) // On track if >= 80% of expected progress
  }).length
)

const behindScheduleGoalsCount = computed(() =>
  goalsStore.userGoals.filter(goal => {
    if (goal.progressPercentage >= 100) return false
    const timeProgress = getTimeProgress(goal.startDate, goal.targetDate)
    return goal.progressPercentage < (timeProgress * 0.8) // Behind if < 80% of expected progress
  }).length
)

const completedPercentage = computed(() => 
  goalsStore.userGoals.length > 0 
    ? Math.round((completedGoalsCount.value / goalsStore.userGoals.length) * 100)
    : 0
)

// Filtered goals based on active filter
const filteredGoals = computed(() => {
  const now = new Date()
  switch (activeFilter.value) {
    case 'active':
      return goalsStore.userGoals.filter(goal => goal.progressPercentage < 100 && new Date(goal.targetDate) > now)
    case 'completed':
      return goalsStore.userGoals.filter(goal => goal.progressPercentage >= 100)
    case 'overdue':
      return goalsStore.userGoals.filter(goal => goal.progressPercentage < 100 && new Date(goal.targetDate) < now)
    default:
      return goalsStore.userGoals
  }
})

// Methods
function setActiveFilter(filter: string) {
  activeFilter.value = filter
}

function getTimeProgress(startDate: string, targetDate: string): number {
  const now = new Date()
  const target = new Date(targetDate)
  const start = new Date(startDate)
  const totalTime = target.getTime() - start.getTime()
  const elapsedTime = now.getTime() - start.getTime()
  return Math.min(Math.max(elapsedTime / totalTime, 0), 1) * 100
}

function getGoalStatus(goal: any): string {
  if (goal.progressPercentage >= 100) return 'Completed'
  if (new Date(goal.targetDate) < new Date()) return 'Overdue'
  const timeProgress = getTimeProgress(goal.startDate, goal.targetDate)
  return goal.progressPercentage >= (timeProgress * 0.8) ? 'On Track' : 'Behind Schedule'
}

function getGoalCardClass(goal: any): string {
  const status = getGoalStatus(goal)
  const classes = []
  
  if (status === 'Completed') classes.push('border-success')
  else if (status === 'Overdue') classes.push('border-danger')
  else if (status === 'Behind Schedule') classes.push('border-warning')
  else classes.push('border-primary')
  
  return classes.join(' ')
}

function getProgressBarClass(goal: any): string {
  if (goal.progressPercentage >= 100) return 'bg-success'
  if (new Date(goal.targetDate) < new Date()) return 'bg-danger'
  const timeProgress = getTimeProgress(goal.startDate, goal.targetDate)
  return goal.progressPercentage >= (timeProgress * 0.8) ? 'bg-primary' : 'bg-warning'
}

function getStatusIndicatorClass(goal: any): string {
  const status = getGoalStatus(goal)
  if (status === 'Completed') return 'text-success'
  if (status === 'Overdue') return 'text-danger'
  if (status === 'Behind Schedule') return 'text-warning'
  return 'text-primary'
}

function getCategoryBadgeClass(category: string): string {
  const categoryClasses = {
    'Emergency Fund': 'bg-danger',
    'Retirement': 'bg-primary',
    'Education': 'bg-info',
    'Home Purchase': 'bg-success',
    'Investment': 'bg-warning',
    'Travel': 'bg-secondary'
  }
  return categoryClasses[category as keyof typeof categoryClasses] || 'bg-secondary'
}

function getPriorityBadgeClass(priority: string): string {
  const priorityClasses = {
    'high': 'bg-danger',
    'medium': 'bg-warning', 
    'low': 'bg-success'
  }
  return priorityClasses[priority.toLowerCase() as keyof typeof priorityClasses] || 'bg-secondary'
}

function getDaysLeft(targetDate: string): string {
  const now = new Date()
  const target = new Date(targetDate)
  const diffTime = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return '1 day left'
  return `${diffDays} days left`
}

function getDaysLeftClass(goal: any): string {
  const now = new Date()
  const target = new Date(goal.targetDate)
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-danger'
  if (diffDays <= 30) return 'text-warning'
  return 'text-muted'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatCurrency(amount: number, currency = 'MYR'): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

async function refreshGoals() {
  await goalsStore.loadGoals()
}

onMounted(async () => {
  if (!goalsStore.userGoals.length) {
    await goalsStore.loadGoals()
  }
})
</script>

<style scoped>
.goal-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.progress {
  border-radius: 4px;
}

.progress-bar {
  transition: width 0.3s ease;
}

.nav-pills .nav-link {
  color: var(--bs-dark);
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-pills .nav-link.active {
  background-color: var(--cimb-red);
  color: white;
}

.nav-pills .nav-link:hover:not(.active) {
  background-color: rgba(220, 20, 60, 0.1);
  color: var(--cimb-red);
}

@media (max-width: 768px) {
  .goal-card {
    margin-bottom: 1rem;
  }
  
  .nav-pills {
    flex-direction: column;
  }
  
  .nav-pills .nav-item {
    margin-bottom: 0.25rem;
  }
}

.border-success {
  border-left: 4px solid var(--bs-success) !important;
}

.border-danger {
  border-left: 4px solid var(--bs-danger) !important;
}

.border-warning {
  border-left: 4px solid var(--bs-warning) !important;
}

.border-primary {
  border-left: 4px solid var(--bs-primary) !important;
}
</style>