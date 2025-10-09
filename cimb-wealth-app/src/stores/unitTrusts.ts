import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import unitTrustsData from '@/data/unit-trusts.json'

interface UnitTrust {
  id: string
  userId: string
  fundCode: string
  fundName: string
  fundType: string
  category: string
  riskLevel: string
  units: number
  navPrice: number
  averageCost: number
  currentValue: number
  unrealizedGain: number
  unrealizedGainPercent: number
  currency: string
  fundManager: string
  inceptionDate: string
  purchaseDate: string
  minimumInvestment: number
  annualManagementFee: number
  salesCharge: number
  yearToDateReturn: number
  oneYearReturn: number
  threeYearReturn: number
  fiveYearReturn: number
  lastUpdated: string
}

export const useUnitTrustsStore = defineStore('unitTrusts', () => {
  const unitTrusts = ref<UnitTrust[]>(unitTrustsData as UnitTrust[])
  
  const totalValue = computed(() => 
    unitTrusts.value.reduce((sum, ut) => sum + ut.currentValue, 0)
  )
  
  const totalUnrealizedGain = computed(() => 
    unitTrusts.value.reduce((sum, ut) => sum + ut.unrealizedGain, 0)
  )
  
  const totalUnrealizedGainPercent = computed(() => {
    const totalCost = unitTrusts.value.reduce((sum, ut) => sum + (ut.units * ut.averageCost), 0)
    return totalCost > 0 ? (totalUnrealizedGain.value / totalCost) * 100 : 0
  })
  
  const fundsByType = computed(() => {
    const groups: Record<string, UnitTrust[]> = {}
    unitTrusts.value.forEach(ut => {
      if (!groups[ut.fundType]) {
        groups[ut.fundType] = []
      }
      groups[ut.fundType].push(ut)
    })
    return groups
  })
  
  const assetAllocation = computed(() => {
    const allocation: Record<string, number> = {}
    unitTrusts.value.forEach(ut => {
      if (!allocation[ut.fundType]) {
        allocation[ut.fundType] = 0
      }
      allocation[ut.fundType] += ut.currentValue
    })
    return Object.entries(allocation).map(([type, value]) => ({
      type,
      value,
      percentage: (value / totalValue.value) * 100
    }))
  })
  
  const topPerformers = computed(() => 
    [...unitTrusts.value]
      .sort((a, b) => b.unrealizedGainPercent - a.unrealizedGainPercent)
      .slice(0, 5)
  )
  
  const byRiskLevel = computed(() => {
    const groups: Record<string, UnitTrust[]> = {}
    unitTrusts.value.forEach(ut => {
      if (!groups[ut.riskLevel]) {
        groups[ut.riskLevel] = []
      }
      groups[ut.riskLevel].push(ut)
    })
    return groups
  })
  
  function getUnitTrustById(id: string) {
    return unitTrusts.value.find(ut => ut.id === id)
  }
  
  function buyUnitTrust(fundCode: string, amount: number) {
    const existingUT = unitTrusts.value.find(ut => ut.fundCode === fundCode)
    
    if (existingUT) {
      const newUnits = amount / existingUT.navPrice
      const totalUnits = existingUT.units + newUnits
      existingUT.averageCost = ((existingUT.units * existingUT.averageCost) + amount) / totalUnits
      existingUT.units = totalUnits
      existingUT.currentValue = totalUnits * existingUT.navPrice
      existingUT.unrealizedGain = existingUT.currentValue - (totalUnits * existingUT.averageCost)
      existingUT.unrealizedGainPercent = (existingUT.unrealizedGain / (totalUnits * existingUT.averageCost)) * 100
    }
  }
  
  function sellUnitTrust(id: string, unitsToSell: number) {
    const ut = unitTrusts.value.find(u => u.id === id)
    if (ut && unitsToSell <= ut.units) {
      ut.units -= unitsToSell
      ut.currentValue = ut.units * ut.navPrice
      ut.unrealizedGain = ut.currentValue - (ut.units * ut.averageCost)
      ut.unrealizedGainPercent = ut.units > 0 
        ? (ut.unrealizedGain / (ut.units * ut.averageCost)) * 100 
        : 0
    }
  }
  
  function switchUnitTrust(fromId: string, toFundCode: string, amount: number) {
    sellUnitTrust(fromId, amount)
    buyUnitTrust(toFundCode, amount)
  }
  
  return {
    unitTrusts,
    totalValue,
    totalUnrealizedGain,
    totalUnrealizedGainPercent,
    fundsByType,
    assetAllocation,
    topPerformers,
    byRiskLevel,
    getUnitTrustById,
    buyUnitTrust,
    sellUnitTrust,
    switchUnitTrust
  }
})
