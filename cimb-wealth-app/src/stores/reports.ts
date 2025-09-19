import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import reportsData from '@/data/reports.json'
import * as FileSaver from 'file-saver'

interface AssetBreakdown {
  value: number
  percentage: number
  currency: string
  holdings: Array<{
    ticker?: string
    type?: string
    value: number
    percentage: number
  }>
}

interface PerformanceMetrics {
  totalReturn: { amount: number, percentage: number, period: string }
  unrealizedGains: { amount: number, percentage: number }
  realizedGains: { amount: number, percentage: number }
  dividendIncome: { amount: number, percentage: number, frequency: string }
  portfolioVolatility: number
  sharpeRatio: number
  maxDrawdown: number
}

interface Report {
  userId: string
  reportDate: string
  reportPeriod: string
  baseCurrency: string
  fxRates: Record<string, number>
  valuationDate: string
  summary: {
    totalAssets: number
    totalLiabilities: number
    netWorth: number
    currency: string
    note: string
    changeFromPreviousQuarter: { amount: number, percentage: number }
    changeFromPreviousYear: { amount: number, percentage: number }
  }
  assetBreakdown: {
    stocks: AssetBreakdown
    etfs: AssetBreakdown
    reits: AssetBreakdown
    cryptocurrency: AssetBreakdown
    commodities: AssetBreakdown
    cash_equivalents: AssetBreakdown
  }
  performanceMetrics: PerformanceMetrics
  sectorAllocation: Record<string, { value: number, percentage: number }>
  riskMetrics: {
    riskLevel: string
    riskScore: number
    diversificationScore: number
    concentrationRisk: string
    topHoldingsConcentration: number
    currencyExposure: Record<string, number>
  }
  goalProgress: Record<string, {
    targetAmount: number
    currentAmount: number
    progressPercentage: number
    onTrack: boolean
  }>
  incomeAnalysis: {
    monthlyIncome: Record<string, number>
    yearToDateIncome: Record<string, number>
    incomeGrowth: { yearOverYear: number, trend: string }
  }
  expenseAnalysis: {
    monthlyExpenses: Record<string, number>
    savingsRate: number
    emergencyFundCoverage: number
  }
  recommendations: Array<{
    type: string
    priority: string
    title: string
    description: string
  }>
  complianceStatus: {
    riskTolerance: string
    regulatoryRequirements: string
    amlChecks: string
    lastReview: string
    nextReview: string
  }
  metadata: {
    generatedAt: string
    reportVersion: string
    dataSource: string
    advisor: string
    advisorId: string
    reportType: string
    confidentialityLevel: string
  }
}

export const useReportsStore = defineStore('reports', () => {
  const authStore = useAuthStore()
  const reportData = ref<Report | null>(null)
  const loading = ref(false)
  const error = ref('')
  const exportLoading = ref(false)

  const currentReport = computed(() => reportData.value)
  const reportSummary = computed(() => reportData.value?.summary)
  const assetAllocation = computed(() => reportData.value?.assetBreakdown)
  const performance = computed(() => reportData.value?.performanceMetrics)
  const sectorBreakdown = computed(() => reportData.value?.sectorAllocation)
  const riskAnalysis = computed(() => reportData.value?.riskMetrics)
  const recommendations = computed(() => reportData.value?.recommendations)

  const topSectors = computed(() => {
    if (!sectorBreakdown.value) return []
    return Object.entries(sectorBreakdown.value)
      .map(([sector, data]) => ({ sector, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  })

  const assetAllocationChart = computed(() => {
    if (!assetAllocation.value) return []
    return Object.entries(assetAllocation.value)
      .map(([type, data]) => ({
        label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: data.value,
        percentage: data.percentage
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
  })

  async function loadReport() {
    if (!authStore.currentUser) return

    try {
      loading.value = true
      error.value = ''
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Load report data (in real app, this would be user-specific)
      if (reportsData.userId === authStore.currentUser.id) {
        reportData.value = reportsData as Report
      } else {
        // Generate mock report for other users
        reportData.value = {
          ...reportsData as Report,
          userId: authStore.currentUser.id,
          reportDate: new Date().toISOString().split('T')[0],
          metadata: {
            ...reportsData.metadata,
            generatedAt: new Date().toISOString()
          }
        }
      }
      
    } catch (err) {
      console.error('Error loading report:', err)
      error.value = 'Failed to load report data'
    } finally {
      loading.value = false
    }
  }

  function generateReportSummary(): string {
    if (!reportData.value) return ''
    
    const report = reportData.value
    return `
CIMB Wealth Management Report
Generated: ${new Date(report.metadata.generatedAt).toLocaleDateString()}
Period: ${report.reportPeriod}

PORTFOLIO SUMMARY
Net Worth: ${report.summary.currency} ${report.summary.netWorth.toLocaleString()}
Total Assets: ${report.summary.currency} ${report.summary.totalAssets.toLocaleString()}
Total Liabilities: ${report.summary.currency} ${report.summary.totalLiabilities.toLocaleString()}

Change from Previous Quarter: ${report.summary.changeFromPreviousQuarter.percentage}%
Change from Previous Year: ${report.summary.changeFromPreviousYear.percentage}%

PERFORMANCE METRICS
Total Return (YTD): ${report.performanceMetrics.totalReturn.percentage}%
Unrealized Gains: ${report.performanceMetrics.unrealizedGains.percentage}%
Portfolio Volatility: ${report.performanceMetrics.portfolioVolatility}%
Sharpe Ratio: ${report.performanceMetrics.sharpeRatio}

ASSET ALLOCATION
${Object.entries(report.assetBreakdown).map(([type, data]) => 
  `${type.replace(/_/g, ' ').toUpperCase()}: ${data.percentage.toFixed(1)}% (${report.baseCurrency} ${data.value.toLocaleString()})`
).join('\n')}

TOP RECOMMENDATIONS
${report.recommendations.slice(0, 3).map((rec, index) => 
  `${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}: ${rec.description}`
).join('\n')}

COMPLIANCE STATUS
Risk Tolerance: ${report.complianceStatus.riskTolerance}
Regulatory Requirements: ${report.complianceStatus.regulatoryRequirements}
Last Review: ${new Date(report.complianceStatus.lastReview).toLocaleDateString()}

This report is confidential and proprietary to CIMB Wealth Management.
`.trim()
  }

  async function exportReportAsCSV() {
    if (!reportData.value) return

    try {
      exportLoading.value = true
      
      const report = reportData.value
      const csvData = [
        ['CIMB Wealth Management Report'],
        ['Generated', new Date(report.metadata.generatedAt).toLocaleDateString()],
        ['Period', report.reportPeriod],
        [''],
        ['Portfolio Summary'],
        ['Net Worth', report.summary.netWorth],
        ['Total Assets', report.summary.totalAssets], 
        ['Total Liabilities', report.summary.totalLiabilities],
        [''],
        ['Asset Allocation'],
        ...Object.entries(report.assetBreakdown).map(([type, data]) => [
          type.replace(/_/g, ' ').toUpperCase(),
          data.value,
          data.percentage + '%'
        ]),
        [''],
        ['Sector Allocation'],
        ...Object.entries(report.sectorAllocation).map(([sector, data]) => [
          sector.toUpperCase(),
          data.value,
          data.percentage + '%'
        ]),
        [''],
        ['Performance Metrics'],
        ['Total Return', report.performanceMetrics.totalReturn.percentage + '%'],
        ['Unrealized Gains', report.performanceMetrics.unrealizedGains.percentage + '%'],
        ['Dividend Income', report.performanceMetrics.dividendIncome.percentage + '%'],
        ['Portfolio Volatility', report.performanceMetrics.portfolioVolatility + '%'],
        ['Sharpe Ratio', report.performanceMetrics.sharpeRatio],
        [''],
        ['Recommendations'],
        ...report.recommendations.map(rec => [
          rec.priority.toUpperCase(),
          rec.title,
          rec.description
        ])
      ]

      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const fileName = `CIMB_Wealth_Report_${report.reportPeriod.replace(/-/g, '_')}.csv`
      
      FileSaver.saveAs(blob, fileName)
      
    } catch (err) {
      console.error('Error exporting CSV:', err)
      error.value = 'Failed to export report as CSV'
    } finally {
      exportLoading.value = false
    }
  }

  async function exportReportAsPDF() {
    try {
      exportLoading.value = true
      
      // Simulate PDF generation delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const reportContent = generateReportSummary()
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' })
      const fileName = `CIMB_Wealth_Report_${reportData.value?.reportPeriod.replace(/-/g, '_')}.txt`
      
      FileSaver.saveAs(blob, fileName)
      
      // Note: In a real application, this would generate an actual PDF using libraries like jsPDF or Puppeteer
      
    } catch (err) {
      console.error('Error exporting PDF:', err)
      error.value = 'Failed to export report as PDF'
    } finally {
      exportLoading.value = false
    }
  }

  function getRecommendationsByPriority(priority: string) {
    return recommendations.value?.filter(rec => rec.priority === priority) || []
  }

  function formatCurrency(amount: number, currency = 'MYR'): string {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  function formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-MY', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100)
  }

  return {
    reportData,
    loading,
    error,
    exportLoading,
    currentReport,
    reportSummary,
    assetAllocation,
    performance,
    sectorBreakdown,
    riskAnalysis,
    recommendations,
    topSectors,
    assetAllocationChart,
    loadReport,
    generateReportSummary,
    exportReportAsCSV,
    exportReportAsPDF,
    getRecommendationsByPriority,
    formatCurrency,
    formatPercentage
  }
})