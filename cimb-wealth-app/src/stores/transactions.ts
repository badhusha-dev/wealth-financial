import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import transactionsData from '@/data/transactions.json'

interface Transaction {
  id: string
  userId: string
  date: string
  description: string
  category: string
  type: 'credit' | 'debit' | 'neutral'
  amount: number
  balance: number
  currency: string
  reference: string
  status: 'completed' | 'pending' | 'failed'
}

export const useTransactionsStore = defineStore('transactions', () => {
  const authStore = useAuthStore()
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(20)
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const selectedType = ref('')
  const dateRange = ref({ start: '', end: '' })

  const userTransactions = computed(() => 
    transactions.value.filter(transaction => transaction.userId === authStore.currentUser?.id)
  )

  const filteredTransactions = computed(() => {
    let filtered = [...userTransactions.value]

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(query) ||
        transaction.reference.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory.value) {
      filtered = filtered.filter(transaction => transaction.category === selectedCategory.value)
    }

    // Type filter  
    if (selectedType.value) {
      filtered = filtered.filter(transaction => transaction.type === selectedType.value)
    }

    // Date range filter
    if (dateRange.value.start) {
      filtered = filtered.filter(transaction => transaction.date >= dateRange.value.start)
    }
    if (dateRange.value.end) {
      filtered = filtered.filter(transaction => transaction.date <= dateRange.value.end)
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  const paginatedTransactions = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredTransactions.value.slice(start, end)
  })

  const totalPages = computed(() => 
    Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
  )

  const categories = computed(() => {
    const uniqueCategories = new Set(userTransactions.value.map(t => t.category))
    return Array.from(uniqueCategories).sort()
  })

  const monthlyTransactionSummary = computed(() => {
    const monthlyMap = new Map<string, { credit: number, debit: number, count: number }>()
    
    userTransactions.value.forEach(transaction => {
      const monthKey = transaction.date.substring(0, 7) // YYYY-MM format
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { credit: 0, debit: 0, count: 0 })
      }
      
      const summary = monthlyMap.get(monthKey)!
      summary.count++
      
      if (transaction.type === 'credit') {
        summary.credit += transaction.amount
      } else if (transaction.type === 'debit') {
        summary.debit += Math.abs(transaction.amount)
      }
    })
    
    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        ...data,
        net: data.credit - data.debit
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12) // Last 12 months
  })

  const recentTransactions = computed(() => 
    filteredTransactions.value.slice(0, 10)
  )

  const totalIncome = computed(() => 
    userTransactions.value
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalExpenses = computed(() => 
    userTransactions.value
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  )

  async function loadTransactions() {
    if (!authStore.currentUser) return

    try {
      loading.value = true
      error.value = ''
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Load transactions data
      transactions.value = transactionsData as Transaction[]
      
    } catch (err) {
      console.error('Error loading transactions:', err)
      error.value = 'Failed to load transaction data'
    } finally {
      loading.value = false
    }
  }

  function setPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function setItemsPerPage(items: number) {
    itemsPerPage.value = items
    currentPage.value = 1
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
    currentPage.value = 1
  }

  function setCategoryFilter(category: string) {
    selectedCategory.value = category
    currentPage.value = 1
  }

  function setTypeFilter(type: string) {
    selectedType.value = type
    currentPage.value = 1
  }

  function setDateRange(start: string, end: string) {
    dateRange.value = { start, end }
    currentPage.value = 1
  }

  function clearFilters() {
    searchQuery.value = ''
    selectedCategory.value = ''
    selectedType.value = ''
    dateRange.value = { start: '', end: '' }
    currentPage.value = 1
  }

  function getTransactionById(id: string): Transaction | undefined {
    return transactions.value.find(transaction => transaction.id === id)
  }

  return {
    transactions,
    loading,
    error,
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedCategory,
    selectedType,
    dateRange,
    userTransactions,
    filteredTransactions,
    paginatedTransactions,
    totalPages,
    categories,
    monthlyTransactionSummary,
    recentTransactions,
    totalIncome,
    totalExpenses,
    loadTransactions,
    setPage,
    setItemsPerPage,
    setSearchQuery,
    setCategoryFilter,
    setTypeFilter,
    setDateRange,
    clearFilters,
    getTransactionById
  }
})