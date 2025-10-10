<template>
  <div class="bonds-reports-view">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2>Bond Reports</h2>
          <p class="text-muted mb-0">Export and download bond portfolio reports</p>
        </div>
      </div>

      <!-- Report Options -->
      <div class="row">
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="report-icon mb-3">
                <i class="fas fa-file-csv fa-3x text-primary"></i>
              </div>
              <h5 class="card-title">Portfolio Summary</h5>
              <p class="card-text">Export your complete bond portfolio with holdings, values, and performance metrics.</p>
              <button class="btn btn-primary w-100" @click="exportPortfolioSummary">
                <i class="fas fa-download me-2"></i>
                Download CSV
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="report-icon mb-3">
                <i class="fas fa-calendar-alt fa-3x text-success"></i>
              </div>
              <h5 class="card-title">Coupon Payment Calendar</h5>
              <p class="card-text">Download a schedule of all upcoming coupon payments for your bond holdings.</p>
              <button class="btn btn-success w-100" @click="exportCouponCalendar">
                <i class="fas fa-download me-2"></i>
                Download CSV
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="report-icon mb-3">
                <i class="fas fa-chart-bar fa-3x text-info"></i>
              </div>
              <h5 class="card-title">Bond Analytics Report</h5>
              <p class="card-text">Export detailed bond analytics including YTM, duration, and convexity metrics.</p>
              <button class="btn btn-info w-100" @click="exportAnalyticsReport">
                <i class="fas fa-download me-2"></i>
                Download CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Downloads -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Export History</h5>
            </div>
            <div class="card-body">
              <div v-if="exportHistory.length === 0" class="text-center text-muted py-4">
                <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                <p>No exports yet. Download your first report above.</p>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Report Type</th>
                      <th>Export Date</th>
                      <th>File Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(export_item, index) in exportHistory" :key="index">
                      <td>{{ export_item.type }}</td>
                      <td>{{ formatDateTime(export_item.date) }}</td>
                      <td><code>{{ export_item.filename }}</code></td>
                      <td><span class="badge bg-success">Completed</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBondsStore } from '@/stores/bonds'

const bondsStore = useBondsStore()

interface ExportRecord {
  type: string
  date: string
  filename: string
}

const exportHistory = ref<ExportRecord[]>([])

function exportPortfolioSummary() {
  const csvContent = generatePortfolioCSV()
  const filename = `bond-portfolio-summary-${getDateString()}.csv`
  downloadCSV(csvContent, filename)
  addToHistory('Portfolio Summary', filename)
}

function exportCouponCalendar() {
  const csvContent = generateCouponCalendarCSV()
  const filename = `bond-coupon-calendar-${getDateString()}.csv`
  downloadCSV(csvContent, filename)
  addToHistory('Coupon Payment Calendar', filename)
}

function exportAnalyticsReport() {
  const csvContent = generateAnalyticsCSV()
  const filename = `bond-analytics-report-${getDateString()}.csv`
  downloadCSV(csvContent, filename)
  addToHistory('Bond Analytics Report', filename)
}

function generatePortfolioCSV(): string {
  const headers = ['Bond Name', 'ISIN', 'Quantity', 'Purchase Price', 'Current Price', 'Investment', 'Current Value', 'Gain/Loss', 'Gain/Loss %', 'Yield %']
  const rows = bondsStore.bondHoldings.map(h => [
    h.bondDetails.bondName,
    h.bondDetails.isin,
    h.quantity,
    h.purchasePrice.toFixed(2),
    h.bondDetails.currentPrice.toFixed(2),
    h.totalInvestment.toFixed(2),
    h.currentValue.toFixed(2),
    h.unrealizedGain.toFixed(2),
    h.unrealizedGainPercent.toFixed(2),
    h.bondDetails.yield.toFixed(2)
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

function generateCouponCalendarCSV(): string {
  const headers = ['Bond Name', 'ISIN', 'Coupon Rate %', 'Next Payment Date', 'Payment Amount (per bond)', 'Total Payment (your holdings)', 'Frequency']
  const rows = bondsStore.bondHoldings.map(h => {
    const couponPayment = (h.bondDetails.faceValue * h.bondDetails.couponRate / 100) / getPaymentsPerYear(h.bondDetails.frequency)
    const totalPayment = couponPayment * h.quantity
    
    return [
      h.bondDetails.bondName,
      h.bondDetails.isin,
      h.bondDetails.couponRate,
      h.nextCouponDate,
      couponPayment.toFixed(2),
      totalPayment.toFixed(2),
      h.bondDetails.frequency
    ]
  })

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

function generateAnalyticsCSV(): string {
  const headers = ['Bond Name', 'ISIN', 'YTM %', 'Macaulay Duration', 'Modified Duration', 'Convexity', 'Risk Level', 'Rating']
  const rows = bondsStore.bondHoldings.map(h => {
    const bond = h.bondDetails
    return [
      bond.bondName,
      bond.isin,
      bondsStore.calculateYTM(bond).toFixed(2),
      bondsStore.calculateMacaulayDuration(bond).toFixed(2),
      bondsStore.calculateModifiedDuration(bond).toFixed(2),
      bondsStore.calculateConvexity(bond).toFixed(2),
      bond.riskLevel,
      bond.rating
    ]
  })

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

function getPaymentsPerYear(frequency: string): number {
  const map: Record<string, number> = {
    'Annual': 1,
    'Semi-Annual': 2,
    'Quarterly': 4,
    'Monthly': 12
  }
  return map[frequency] || 1
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function getDateString(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

function addToHistory(type: string, filename: string) {
  exportHistory.value.unshift({
    type,
    date: new Date().toISOString(),
    filename
  })
  
  if (exportHistory.value.length > 10) {
    exportHistory.value = exportHistory.value.slice(0, 10)
  }
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-MY', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.bonds-reports-view {
  min-height: 100vh;
}

.report-icon {
  text-align: center;
  padding: 1rem 0;
}

.card-title {
  font-weight: 600;
  margin-bottom: 1rem;
}

.card-text {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

code {
  color: var(--cimb-red);
  background: var(--bs-light);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
</style>
