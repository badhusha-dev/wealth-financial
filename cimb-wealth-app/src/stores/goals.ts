import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import goalsData from '@/data/goals.json'

interface GoalMilestone {
  amount: number
  date: string
  description: string
  achieved: boolean
  achievedDate?: string
  estimatedDate?: string
}

interface Goal {
  id: string
  userId: string
  title: string
  description: string
  category: string
  targetAmount: number
  currentAmount: number
  currency: string
  targetDate: string
  startDate: string
  monthlyContribution: number
  progressPercentage: number
  status: 'active' | 'completed' | 'paused' | 'near_completion'
  priority: 'low' | 'medium' | 'high'
  riskTolerance: 'conservative' | 'moderate' | 'moderate_aggressive' | 'aggressive'
  investmentStrategy: string
  milestones: GoalMilestone[]
  linkedAccounts: string[]
  additionalInfo?: Record<string, any>
  createdAt: string
  lastUpdated: string
}

export const useGoalsStore = defineStore('goals', () => {
  const authStore = useAuthStore()
  const goals = ref<Goal[]>([])
  const loading = ref(false)
  const error = ref('')

  const userGoals = computed(() => 
    goals.value.filter(goal => goal.userId === authStore.currentUser?.id)
  )

  const activeGoals = computed(() => 
    userGoals.value.filter(goal => goal.status === 'active')
  )

  const completedGoals = computed(() => 
    userGoals.value.filter(goal => goal.status === 'completed')
  )

  const nearCompletionGoals = computed(() => 
    userGoals.value.filter(goal => goal.status === 'near_completion')
  )

  const totalTargetAmount = computed(() => 
    activeGoals.value.reduce((total, goal) => total + goal.targetAmount, 0)
  )

  const totalCurrentAmount = computed(() => 
    activeGoals.value.reduce((total, goal) => total + goal.currentAmount, 0)
  )

  const totalMonthlyContributions = computed(() => 
    activeGoals.value.reduce((total, goal) => total + goal.monthlyContribution, 0)
  )

  const overallProgress = computed(() => 
    totalTargetAmount.value > 0 ? (totalCurrentAmount.value / totalTargetAmount.value) * 100 : 0
  )

  const goalsByCategory = computed(() => {
    const categoryMap = new Map<string, Goal[]>()
    
    userGoals.value.forEach(goal => {
      if (!categoryMap.has(goal.category)) {
        categoryMap.set(goal.category, [])
      }
      categoryMap.get(goal.category)!.push(goal)
    })
    
    return Array.from(categoryMap.entries()).map(([category, goalList]) => ({
      category,
      goals: goalList,
      count: goalList.length,
      totalTarget: goalList.reduce((sum, g) => sum + g.targetAmount, 0),
      totalCurrent: goalList.reduce((sum, g) => sum + g.currentAmount, 0),
      averageProgress: goalList.reduce((sum, g) => sum + g.progressPercentage, 0) / goalList.length
    }))
  })

  const goalsByPriority = computed(() => {
    const priorityOrder = ['high', 'medium', 'low']
    return priorityOrder.map(priority => ({
      priority,
      goals: userGoals.value.filter(g => g.priority === priority),
      count: userGoals.value.filter(g => g.priority === priority).length
    }))
  })

  const upcomingMilestones = computed(() => {
    const milestones: Array<{ goal: Goal, milestone: GoalMilestone }> = []
    const today = new Date()
    const sixMonthsLater = new Date()
    sixMonthsLater.setMonth(today.getMonth() + 6)
    
    activeGoals.value.forEach(goal => {
      goal.milestones
        .filter(m => !m.achieved)
        .forEach(milestone => {
          const milestoneDate = new Date(milestone.estimatedDate || milestone.date)
          if (milestoneDate >= today && milestoneDate <= sixMonthsLater) {
            milestones.push({ goal, milestone })
          }
        })
    })
    
    return milestones.sort((a, b) => 
      new Date(a.milestone.estimatedDate || a.milestone.date).getTime() - 
      new Date(b.milestone.estimatedDate || b.milestone.date).getTime()
    )
  })

  async function loadGoals() {
    if (!authStore.currentUser) return

    try {
      loading.value = true
      error.value = ''
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Load goals data
      goals.value = goalsData as Goal[]
      
    } catch (err) {
      console.error('Error loading goals:', err)
      error.value = 'Failed to load goals data'
    } finally {
      loading.value = false
    }
  }

  function getGoalById(id: string): Goal | undefined {
    return goals.value.find(goal => goal.id === id)
  }

  function updateGoalProgress(goalId: string, newAmount: number) {
    const goal = getGoalById(goalId)
    if (goal) {
      goal.currentAmount = newAmount
      goal.progressPercentage = (newAmount / goal.targetAmount) * 100
      goal.lastUpdated = new Date().toISOString()
      
      // Update status based on progress
      if (goal.progressPercentage >= 100) {
        goal.status = 'completed'
      } else if (goal.progressPercentage >= 85) {
        goal.status = 'near_completion'
      } else {
        goal.status = 'active'
      }
      
      // Check if any milestones should be marked as achieved
      goal.milestones.forEach(milestone => {
        if (!milestone.achieved && newAmount >= milestone.amount) {
          milestone.achieved = true
          milestone.achievedDate = new Date().toISOString()
        }
      })
    }
  }

  function addMonthlyContribution(goalId: string) {
    const goal = getGoalById(goalId)
    if (goal) {
      updateGoalProgress(goalId, goal.currentAmount + goal.monthlyContribution)
    }
  }

  function getGoalsByCategory(category: string): Goal[] {
    return userGoals.value.filter(goal => goal.category === category)
  }

  function getTimeToGoal(goalId: string): { months: number, years: number } | null {
    const goal = getGoalById(goalId)
    if (!goal || goal.monthlyContribution <= 0) return null
    
    const remainingAmount = goal.targetAmount - goal.currentAmount
    const monthsRemaining = Math.ceil(remainingAmount / goal.monthlyContribution)
    
    return {
      months: monthsRemaining,
      years: Math.floor(monthsRemaining / 12)
    }
  }

  function calculateProjectedCompletion(goalId: string): string | null {
    const timeToGoal = getTimeToGoal(goalId)
    if (!timeToGoal) return null
    
    const projectedDate = new Date()
    projectedDate.setMonth(projectedDate.getMonth() + timeToGoal.months)
    
    return projectedDate.toISOString().split('T')[0]
  }

  return {
    goals,
    loading,
    error,
    userGoals,
    activeGoals,
    completedGoals,
    nearCompletionGoals,
    totalTargetAmount,
    totalCurrentAmount,
    totalMonthlyContributions,
    overallProgress,
    goalsByCategory,
    goalsByPriority,
    upcomingMilestones,
    loadGoals,
    getGoalById,
    updateGoalProgress,
    addMonthlyContribution,
    getGoalsByCategory,
    getTimeToGoal,
    calculateProjectedCompletion
  }
})