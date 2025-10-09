import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import portfolioData from '@/data/portfolio.json'

interface Holding {
  id: string
  userId: string
  ticker: string
  name: string
  assetType: string
  sector: string
  quantity: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  unrealizedGain: number
  unrealizedGainPercent: number
  currency: string
  exchange: string
  lastUpdated: string
  maturityDate?: string
  interestRate?: number
}

export const usePortfolioStore = defineStore('portfolio', () => {
  const authStore = useAuthStore()
  const holdings = ref<Holding[]>([])
  const loading = ref(false)
  const error = ref('')

  const userHoldings = computed(() => 
    holdings.value.filter(holding => holding.userId === authStore.currentUser?.id)
  )

  const totalPortfolioValue = computed(() => 
    userHoldings.value.reduce((total, holding) => total + holding.totalValue, 0)
  )

  const totalUnrealizedGain = computed(() => 
    userHoldings.value.reduce((total, holding) => total + holding.unrealizedGain, 0)
  )

  const totalUnrealizedGainPercent = computed(() => {
    const totalCost = userHoldings.value.reduce((total, holding) => 
      total + (holding.quantity * holding.averagePrice), 0
    )
    return totalCost > 0 ? (totalUnrealizedGain.value / totalCost) * 100 : 0
  })

  const holdingsBySector = computed(() => {
    const sectorMap = new Map<string, { value: number, holdings: Holding[] }>()
    
    userHoldings.value.forEach(holding => {
      if (!sectorMap.has(holding.sector)) {
        sectorMap.set(holding.sector, { value: 0, holdings: [] })
      }
      const sector = sectorMap.get(holding.sector)!
      sector.value += holding.totalValue
      sector.holdings.push(holding)
    })
    
    return Array.from(sectorMap.entries()).map(([sector, data]) => ({
      sector,
      value: data.value,
      percentage: (data.value / totalPortfolioValue.value) * 100,
      holdings: data.holdings
    })).sort((a, b) => b.value - a.value)
  })

  const holdingsByAssetType = computed(() => {
    const typeMap = new Map<string, number>()
    
    userHoldings.value.forEach(holding => {
      const currentValue = typeMap.get(holding.assetType) || 0
      typeMap.set(holding.assetType, currentValue + holding.totalValue)
    })
    
    return Array.from(typeMap.entries()).map(([type, value]) => ({
      type,
      value,
      percentage: (value / totalPortfolioValue.value) * 100
    })).sort((a, b) => b.value - a.value)
  })

  const topPerformers = computed(() => 
    [...userHoldings.value]
      .sort((a, b) => b.unrealizedGainPercent - a.unrealizedGainPercent)
      .slice(0, 5)
  )

  const bottomPerformers = computed(() => 
    [...userHoldings.value]
      .sort((a, b) => a.unrealizedGainPercent - b.unrealizedGainPercent)
      .slice(0, 5)
  )

  async function loadPortfolio() {
    if (!authStore.currentUser) return

    try {
      loading.value = true
      error.value = ''
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Load portfolio data
      holdings.value = portfolioData as Holding[]
      
    } catch (err) {
      console.error('Error loading portfolio:', err)
      error.value = 'Failed to load portfolio data'
    } finally {
      loading.value = false
    }
  }

  function getHoldingById(id: string): Holding | undefined {
    return holdings.value.find(holding => holding.id === id)
  }

  function getHoldingsByTickers(tickers: string[]): Holding[] {
    return holdings.value.filter(holding => tickers.includes(holding.ticker))
  }

  async function updateHoldingPrice(holdingId: string, newPrice: number) {
    const holding = getHoldingById(holdingId)
    if (holding) {
      const oldValue = holding.totalValue
      
      holding.currentPrice = newPrice
      holding.totalValue = holding.quantity * newPrice
      holding.unrealizedGain = holding.totalValue - (holding.quantity * holding.averagePrice)
      holding.unrealizedGainPercent = ((holding.currentPrice - holding.averagePrice) / holding.averagePrice) * 100
      holding.lastUpdated = new Date().toISOString()
    }
  }

  function refreshPortfolio() {
    loadPortfolio()
  }

  return {
    holdings,
    loading,
    error,
    userHoldings,
    totalPortfolioValue,
    totalUnrealizedGain,
    totalUnrealizedGainPercent,
    holdingsBySector,
    holdingsByAssetType,
    topPerformers,
    bottomPerformers,
    loadPortfolio,
    getHoldingById,
    getHoldingsByTickers,
    updateHoldingPrice,
    refreshPortfolio
  }
})