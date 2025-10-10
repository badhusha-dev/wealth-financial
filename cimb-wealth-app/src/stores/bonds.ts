import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import bondsMarketData from '@/data/bonds-market.json'
import userBondsData from '@/data/user-bonds.json'

export interface Bond {
  id: string
  isin: string
  issuer: string
  bondName: string
  bondType: 'Government' | 'Corporate'
  sector: string
  couponRate: number
  faceValue: number
  currentPrice: number
  yield: number
  maturityDate: string
  issueDate: string
  rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B'
  riskLevel: string
  frequency: 'Annual' | 'Semi-Annual' | 'Quarterly' | 'Monthly'
  minimumInvestment: number
  outstandingAmount: number
  currency: string
}

export interface UserBond {
  id: string
  bondId: string
  userId: string
  quantity: number
  purchasePrice: number
  purchaseDate: string
  totalInvestment: number
  nextCouponDate: string
  accruedInterest: number
  lastUpdated: string
}

export interface BondHolding extends UserBond {
  bondDetails: Bond
  currentValue: number
  unrealizedGain: number
  unrealizedGainPercent: number
}

export const useBondsStore = defineStore('bonds', () => {
  const marketBonds = ref<Bond[]>(JSON.parse(JSON.stringify(bondsMarketData)) as Bond[])
  const userBonds = ref<UserBond[]>(JSON.parse(JSON.stringify(userBondsData)) as UserBond[])

  // Computed: Bond Holdings with enriched data
  const bondHoldings = computed<BondHolding[]>(() => {
    return userBonds.value.map(ub => {
      const bondDetails = marketBonds.value.find(b => b.id === ub.bondId)!
      const currentValue = ub.quantity * bondDetails.currentPrice
      const unrealizedGain = currentValue - ub.totalInvestment
      const unrealizedGainPercent = (unrealizedGain / ub.totalInvestment) * 100

      return {
        ...ub,
        bondDetails,
        currentValue,
        unrealizedGain,
        unrealizedGainPercent
      }
    })
  })

  // Computed: Total portfolio value
  const totalPortfolioValue = computed(() => 
    bondHoldings.value.reduce((sum, h) => sum + h.currentValue, 0)
  )

  // Computed: Total investment
  const totalInvestment = computed(() =>
    bondHoldings.value.reduce((sum, h) => sum + h.totalInvestment, 0)
  )

  // Computed: Total unrealized gain
  const totalUnrealizedGain = computed(() =>
    bondHoldings.value.reduce((sum, h) => sum + h.unrealizedGain, 0)
  )

  // Computed: Portfolio yield
  const portfolioYield = computed(() => {
    if (bondHoldings.value.length === 0) return 0
    const weightedYield = bondHoldings.value.reduce((sum, h) => {
      const weight = h.currentValue / totalPortfolioValue.value
      return sum + (h.bondDetails.yield * weight)
    }, 0)
    return weightedYield
  })

  // Computed: Bond allocation by type
  const bondAllocationByType = computed(() => {
    const allocation: { type: string; value: number; percentage: number }[] = []
    const types = ['Government', 'Corporate']
    
    types.forEach(type => {
      const value = bondHoldings.value
        .filter(h => h.bondDetails.bondType === type)
        .reduce((sum, h) => sum + h.currentValue, 0)
      
      if (value > 0) {
        allocation.push({
          type,
          value,
          percentage: (value / totalPortfolioValue.value) * 100
        })
      }
    })
    
    return allocation
  })

  // Computed: Bond allocation by sector
  const bondAllocationBySector = computed(() => {
    const sectorMap = new Map<string, number>()
    
    bondHoldings.value.forEach(h => {
      const current = sectorMap.get(h.bondDetails.sector) || 0
      sectorMap.set(h.bondDetails.sector, current + h.currentValue)
    })
    
    return Array.from(sectorMap.entries()).map(([sector, value]) => ({
      sector,
      value,
      percentage: (value / totalPortfolioValue.value) * 100
    }))
  })

  // Computed: Bond allocation by rating
  const bondAllocationByRating = computed(() => {
    const ratingMap = new Map<string, number>()
    
    bondHoldings.value.forEach(h => {
      const current = ratingMap.get(h.bondDetails.rating) || 0
      ratingMap.set(h.bondDetails.rating, current + h.currentValue)
    })
    
    return Array.from(ratingMap.entries())
      .map(([rating, value]) => ({
        rating,
        value,
        percentage: (value / totalPortfolioValue.value) * 100
      }))
      .sort((a, b) => b.value - a.value)
  })

  // Action: Buy Bond
  function buyBond(bondId: string, quantity: number, price: number) {
    const bond = marketBonds.value.find(b => b.id === bondId)
    if (!bond) {
      console.error(`Bond ${bondId} not found`)
      return false
    }

    const existingHolding = userBonds.value.find(ub => ub.bondId === bondId)
    
    if (existingHolding) {
      // Add to existing position
      const totalQuantity = existingHolding.quantity + quantity
      const totalInvestment = existingHolding.totalInvestment + (quantity * price)
      const avgPrice = totalInvestment / totalQuantity
      
      existingHolding.quantity = totalQuantity
      existingHolding.totalInvestment = totalInvestment
      existingHolding.purchasePrice = avgPrice
      existingHolding.lastUpdated = new Date().toISOString().split('T')[0]
    } else {
      // Create new holding
      const newHolding: UserBond = {
        id: 'user-bond-' + Date.now(),
        bondId,
        userId: 'user001',
        quantity,
        purchasePrice: price,
        purchaseDate: new Date().toISOString().split('T')[0],
        totalInvestment: quantity * price,
        nextCouponDate: calculateNextCouponDate(bond),
        accruedInterest: 0,
        lastUpdated: new Date().toISOString().split('T')[0]
      }
      userBonds.value.push(newHolding)
    }

    saveToLocalStorage()
    return true
  }

  // Action: Sell Bond
  function sellBond(userBondId: string, quantity: number) {
    const holding = userBonds.value.find(ub => ub.id === userBondId)
    if (!holding) {
      console.error(`User bond ${userBondId} not found`)
      return false
    }

    if (quantity > holding.quantity) {
      console.error(`Insufficient quantity. Trying to sell ${quantity} but only have ${holding.quantity}`)
      return false
    }

    if (quantity === holding.quantity) {
      // Remove entire holding
      const index = userBonds.value.findIndex(ub => ub.id === userBondId)
      userBonds.value.splice(index, 1)
    } else {
      // Reduce quantity
      const ratio = quantity / holding.quantity
      holding.quantity -= quantity
      holding.totalInvestment -= holding.totalInvestment * ratio
      holding.lastUpdated = new Date().toISOString().split('T')[0]
    }

    saveToLocalStorage()
    return true
  }

  // Helper: Calculate next coupon date
  function calculateNextCouponDate(bond: Bond): string {
    const maturity = new Date(bond.maturityDate)
    const today = new Date()
    
    let monthsToAdd = 12
    if (bond.frequency === 'Semi-Annual') monthsToAdd = 6
    if (bond.frequency === 'Quarterly') monthsToAdd = 3
    if (bond.frequency === 'Monthly') monthsToAdd = 1
    
    const nextDate = new Date(today)
    nextDate.setMonth(nextDate.getMonth() + monthsToAdd)
    
    if (nextDate > maturity) {
      return bond.maturityDate
    }
    
    return nextDate.toISOString().split('T')[0]
  }

  // Bond Calculations: Yield to Maturity (YTM)
  function calculateYTM(bond: Bond, purchasePrice?: number): number {
    const price = purchasePrice || bond.currentPrice
    const faceValue = bond.faceValue
    const couponRate = bond.couponRate / 100
    const annualCoupon = faceValue * couponRate
    const maturityDate = new Date(bond.maturityDate)
    const today = new Date()
    const yearsToMaturity = (maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365)

    // Simplified YTM approximation formula
    const ytm = ((annualCoupon + (faceValue - price) / yearsToMaturity) / ((faceValue + price) / 2)) * 100
    return Math.round(ytm * 100) / 100
  }

  // Bond Calculations: Macaulay Duration
  function calculateMacaulayDuration(bond: Bond): number {
    const faceValue = bond.faceValue
    const couponRate = bond.couponRate / 100
    const ytm = bond.yield / 100
    const maturityDate = new Date(bond.maturityDate)
    const today = new Date()
    const yearsToMaturity = (maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365)
    
    let paymentsPerYear = 1
    if (bond.frequency === 'Semi-Annual') paymentsPerYear = 2
    if (bond.frequency === 'Quarterly') paymentsPerYear = 4
    if (bond.frequency === 'Monthly') paymentsPerYear = 12
    
    const totalPayments = Math.ceil(yearsToMaturity * paymentsPerYear)
    const couponPayment = (faceValue * couponRate) / paymentsPerYear
    const discountRate = ytm / paymentsPerYear
    
    let weightedCashFlows = 0
    let totalPV = 0
    
    for (let t = 1; t <= totalPayments; t++) {
      const pv = couponPayment / Math.pow(1 + discountRate, t)
      weightedCashFlows += (t / paymentsPerYear) * pv
      totalPV += pv
    }
    
    // Add principal
    const principalPV = faceValue / Math.pow(1 + discountRate, totalPayments)
    weightedCashFlows += (totalPayments / paymentsPerYear) * principalPV
    totalPV += principalPV
    
    const duration = weightedCashFlows / totalPV
    return Math.round(duration * 100) / 100
  }

  // Bond Calculations: Modified Duration
  function calculateModifiedDuration(bond: Bond): number {
    const macaulayDuration = calculateMacaulayDuration(bond)
    const ytm = bond.yield / 100
    
    let paymentsPerYear = 1
    if (bond.frequency === 'Semi-Annual') paymentsPerYear = 2
    if (bond.frequency === 'Quarterly') paymentsPerYear = 4
    if (bond.frequency === 'Monthly') paymentsPerYear = 12
    
    const modifiedDuration = macaulayDuration / (1 + ytm / paymentsPerYear)
    return Math.round(modifiedDuration * 100) / 100
  }

  // Bond Calculations: Convexity
  function calculateConvexity(bond: Bond): number {
    const faceValue = bond.faceValue
    const couponRate = bond.couponRate / 100
    const ytm = bond.yield / 100
    const currentPrice = bond.currentPrice
    const maturityDate = new Date(bond.maturityDate)
    const today = new Date()
    const yearsToMaturity = (maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365)
    
    let paymentsPerYear = 1
    if (bond.frequency === 'Semi-Annual') paymentsPerYear = 2
    if (bond.frequency === 'Quarterly') paymentsPerYear = 4
    if (bond.frequency === 'Monthly') paymentsPerYear = 12
    
    const totalPayments = Math.ceil(yearsToMaturity * paymentsPerYear)
    const couponPayment = (faceValue * couponRate) / paymentsPerYear
    const discountRate = ytm / paymentsPerYear
    
    let convexitySum = 0
    
    for (let t = 1; t <= totalPayments; t++) {
      const cashFlow = t === totalPayments ? couponPayment + faceValue : couponPayment
      const pv = cashFlow / Math.pow(1 + discountRate, t)
      convexitySum += (t * (t + 1) * pv) / Math.pow(paymentsPerYear, 2)
    }
    
    const convexity = convexitySum / (currentPrice * Math.pow(1 + discountRate, 2))
    return Math.round(convexity * 100) / 100
  }

  // Bond Calculations: Accrued Interest
  function calculateAccruedInterest(bond: Bond, lastCouponDate: string): number {
    const today = new Date()
    const lastCoupon = new Date(lastCouponDate)
    const daysSinceLastCoupon = Math.floor((today.getTime() - lastCoupon.getTime()) / (1000 * 60 * 60 * 24))
    
    let daysInPeriod = 365
    if (bond.frequency === 'Semi-Annual') daysInPeriod = 182
    if (bond.frequency === 'Quarterly') daysInPeriod = 91
    if (bond.frequency === 'Monthly') daysInPeriod = 30
    
    const annualCoupon = bond.faceValue * (bond.couponRate / 100)
    const periodCoupon = bond.frequency === 'Annual' ? annualCoupon : 
                        bond.frequency === 'Semi-Annual' ? annualCoupon / 2 :
                        bond.frequency === 'Quarterly' ? annualCoupon / 4 :
                        annualCoupon / 12
    
    const accruedInterest = (daysSinceLastCoupon / daysInPeriod) * periodCoupon
    return Math.round(accruedInterest * 100) / 100
  }

  // Helper: Save to localStorage
  function saveToLocalStorage() {
    localStorage.setItem('cimb_user_bonds', JSON.stringify(userBonds.value))
  }

  // Helper: Load from localStorage
  function loadFromLocalStorage() {
    const saved = localStorage.getItem('cimb_user_bonds')
    if (saved) {
      try {
        userBonds.value = JSON.parse(saved)
      } catch (error) {
        console.error('Error loading user bonds from localStorage:', error)
      }
    }
  }

  // Initialize: Load from localStorage on store creation
  loadFromLocalStorage()

  return {
    // State
    marketBonds,
    userBonds,
    
    // Computed
    bondHoldings,
    totalPortfolioValue,
    totalInvestment,
    totalUnrealizedGain,
    portfolioYield,
    bondAllocationByType,
    bondAllocationBySector,
    bondAllocationByRating,
    
    // Actions
    buyBond,
    sellBond,
    
    // Calculations
    calculateYTM,
    calculateMacaulayDuration,
    calculateModifiedDuration,
    calculateConvexity,
    calculateAccruedInterest
  }
})
