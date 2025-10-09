<template>
  <div class="container-fluid p-4">
    <!-- Page Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h2 mb-1 gradient-text font-secondary">Financial Reports</h1>
            <p class="text-muted mb-0">Generate and export comprehensive financial reports</p>
          </div>
          <div class="text-end">
            <button 
              class="btn btn-outline-primary me-2"
              @click="refreshReports"
              :disabled="reportsStore.loading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': reportsStore.loading }"></i>
              Refresh
            </button>
            <div class="export-buttons d-flex gap-2">
              <button class="btn btn-glass micro-bounce" @click="exportAllReports('csv')" title="Export as CSV">
                <i class="fas fa-file-csv me-2 text-success"></i>CSV
              </button>
              <button class="btn btn-glass micro-bounce" @click="exportAllReports('pdf')" title="Export as PDF">
                <i class="fas fa-file-pdf me-2 text-danger"></i>PDF
              </button>
              <button class="btn btn-glass micro-bounce" @click="exportAllReports('excel')" title="Export as Excel">
                <i class="fas fa-file-excel me-2 text-success"></i>Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Filters -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card glass-card card-animated">
          <div class="card-body">
            <div class="row g-3 align-items-end">
              <div class="col-md-3">
                <label class="form-label">Report Type</label>
                <select class="form-select glass" v-model="selectedReportType" @change="filterReports">
                  <option value="">All Report Types</option>
                  <option v-for="type in reportTypes" :key="type" :value="type">
                    {{ formatReportType(type) }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label">Period</label>
                <select class="form-select glass" v-model="selectedPeriod" @change="filterReports">
                  <option value="">All Periods</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label">From Date</label>
                <input 
                  type="date" 
                  class="form-control glass" 
                  v-model="startDate"
                  @change="filterReports"
                >
              </div>
              <div class="col-md-2">
                <label class="form-label">To Date</label>
                <input 
                  type="date" 
                  class="form-control glass" 
                  v-model="endDate"
                  @change="filterReports"
                >
              </div>
              <div class="col-md-2">
                <label class="form-label">Format</label>
                <select class="form-select" v-model="exportFormat">
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
              <div class="col-md-1">
                <button 
                  class="btn btn-outline-secondary w-100" 
                  @click="clearFilters"
                  title="Clear all filters"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reports Summary Cards -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card bg-primary text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Total Reports</h6>
                <h4 class="mb-0">{{ filteredReports.length }}</h4>
                <small class="opacity-75">Available reports</small>
              </div>
              <i class="fas fa-chart-line fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card bg-success text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Generated</h6>
                <h4 class="mb-0">{{ generatedReportsCount }}</h4>
                <small class="opacity-75">Ready to export</small>
              </div>
              <i class="fas fa-check-circle fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card bg-info text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">This Month</h6>
                <h4 class="mb-0">{{ thisMonthReportsCount }}</h4>
                <small class="opacity-75">Current period</small>
              </div>
              <i class="fas fa-calendar fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card bg-warning text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Report Types</h6>
                <h4 class="mb-0">{{ reportTypes.length }}</h4>
                <small class="opacity-75">Different categories</small>
              </div>
              <i class="fas fa-layer-group fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="reportsStore.loading" class="row">
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted">Loading your financial reports...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredReports.length === 0" class="row">
      <div class="col-12 text-center py-5">
        <div class="mb-4">
          <i class="fas fa-chart-bar fa-4x text-muted opacity-50"></i>
        </div>
        <h4 class="text-muted">No Reports Found</h4>
        <p class="text-muted mb-4">
          Generate your first financial report to get started!
        </p>
        <button class="btn btn-primary" @click="refreshReports">
          <i class="fas fa-plus me-2"></i>
          Load Reports
        </button>
      </div>
    </div>

    <!-- Reports Grid -->
    <div v-else class="row">
      <div v-for="report in filteredReports" :key="report.id" class="col-lg-6 col-xl-4 mb-4">
        <div class="card h-100 border-0 shadow-sm report-card">
          <div class="card-body">
            <!-- Report Header -->
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="flex-grow-1">
                <h5 class="card-title mb-1">{{ report.title }}</h5>
                <span class="badge rounded-pill" :class="getReportTypeBadgeClass(report.type)">
                  {{ formatReportType(report.type) }}
                </span>
              </div>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                        type="button" data-bs-toggle="dropdown">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#" @click="viewReport(report)"><i class="fas fa-eye me-2"></i>View</a></li>
                  <li><a class="dropdown-item" href="#" @click="editReport(report)"><i class="fas fa-edit me-2"></i>Edit</a></li>
                  <li><a class="dropdown-item" href="#" @click="duplicateReport(report)"><i class="fas fa-copy me-2"></i>Duplicate</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" @click="deleteReport(report)"><i class="fas fa-trash me-2"></i>Delete</a></li>
                </ul>
              </div>
            </div>

            <!-- Report Details -->
            <div class="row g-2 mb-3">
              <div class="col-6">
                <div class="small text-muted">Generated</div>
                <div class="fw-medium">{{ formatDate(report.generatedAt) }}</div>
              </div>
              <div class="col-6">
                <div class="small text-muted">Period</div>
                <div class="fw-medium">{{ formatPeriod(report.period) }}</div>
              </div>
              <div class="col-6">
                <div class="small text-muted">Data Points</div>
                <div class="fw-medium">{{ report.dataPoints?.toLocaleString() || 'N/A' }}</div>
              </div>
              <div class="col-6">
                <div class="small text-muted">Size</div>
                <div class="fw-medium">{{ formatFileSize(report.fileSize) }}</div>
              </div>
            </div>

            <!-- Report Status -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="small text-muted">Status</span>
                <span class="badge" :class="getStatusBadgeClass(report.status)">
                  {{ formatStatus(report.status) }}
                </span>
              </div>
            </div>

            <!-- Report Description -->
            <p class="card-text small text-muted mb-3" v-if="report.description">
              {{ report.description }}
            </p>

            <!-- Action Buttons -->
            <div class="d-flex gap-2 mb-2">
              <button 
                class="btn btn-sm btn-outline-primary flex-grow-1"
                @click="generateReport(report)"
                :disabled="report.status === 'generating'"
              >
                <i class="fas fa-chart-bar me-1"></i>
                {{ report.status === 'generating' ? 'Generating...' : 'Generate' }}
              </button>
              <div class="dropdown">
                <button class="btn btn-sm btn-success dropdown-toggle" 
                        type="button" data-bs-toggle="dropdown"
                        :disabled="report.status !== 'completed'">
                  <i class="fas fa-download"></i>
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#" @click="downloadReport(report, 'csv')"><i class="fas fa-file-csv me-2"></i>CSV</a></li>
                  <li><a class="dropdown-item" href="#" @click="downloadReport(report, 'pdf')"><i class="fas fa-file-pdf me-2"></i>PDF</a></li>
                  <li><a class="dropdown-item" href="#" @click="downloadReport(report, 'excel')"><i class="fas fa-file-excel me-2"></i>Excel</a></li>
                </ul>
              </div>
            </div>

            <!-- Progress Bar (for generating reports) -->
            <div v-if="report.status === 'generating'" class="progress" style="height: 4px;">
              <div class="progress-bar progress-bar-striped progress-bar-animated" 
                   role="progressbar" style="width: 100%">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReportsStore } from '@/stores/reports'

const reportsStore = useReportsStore()

// Filter state
const selectedReportType = ref('')
const selectedPeriod = ref('')
const startDate = ref('')
const endDate = ref('')
const exportFormat = ref('csv')

// Create mock reports list from existing store structure
const mockReports = computed(() => {
  if (!reportsStore.currentReport) return []
  
  const report = reportsStore.currentReport
  return [
    {
      id: 'portfolio-performance',
      title: 'Portfolio Performance Report',
      type: 'portfolio_performance',
      period: 'quarterly',
      generatedAt: report.metadata.generatedAt,
      status: 'completed',
      description: 'Comprehensive portfolio analysis and performance metrics',
      dataPoints: Object.keys(report.assetBreakdown).length + Object.keys(report.sectorAllocation).length,
      fileSize: 45678,
      currency: report.baseCurrency
    },
    {
      id: 'asset-allocation',
      title: 'Asset Allocation Analysis',
      type: 'balance_sheet',
      period: 'monthly',
      generatedAt: report.metadata.generatedAt,
      status: 'completed',
      description: 'Asset allocation breakdown and risk analysis',
      dataPoints: Object.keys(report.assetBreakdown).length,
      fileSize: 32145,
      currency: report.baseCurrency
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment Report',
      type: 'portfolio_performance',
      period: 'quarterly',
      generatedAt: report.metadata.generatedAt,
      status: 'completed',
      description: 'Portfolio risk metrics and recommendations',
      dataPoints: 15,
      fileSize: 28934,
      currency: report.baseCurrency
    }
  ]
})

// Computed properties
const filteredReports = computed(() => {
  let reports = mockReports.value

  if (selectedReportType.value) {
    reports = reports.filter(report => report.type === selectedReportType.value)
  }

  if (selectedPeriod.value) {
    reports = reports.filter(report => report.period === selectedPeriod.value)
  }

  if (startDate.value || endDate.value) {
    reports = reports.filter(report => {
      const reportDate = new Date(report.generatedAt)
      const start = startDate.value ? new Date(startDate.value) : null
      const end = endDate.value ? new Date(endDate.value) : null

      if (start && reportDate < start) return false
      if (end && reportDate > end) return false
      return true
    })
  }

  return reports
})

const reportTypes = computed(() => ['portfolio_performance', 'balance_sheet', 'income_statement', 'tax_report'])

const generatedReportsCount = computed(() => 
  mockReports.value.filter(report => report.status === 'completed').length
)

const thisMonthReportsCount = computed(() => {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  
  return mockReports.value.filter(report => {
    const reportDate = new Date(report.generatedAt)
    return reportDate.getMonth() === thisMonth && reportDate.getFullYear() === thisYear
  }).length
})

// Methods
function filterReports() {
  // Trigger reactive update - handled by computed property
}

function clearFilters() {
  selectedReportType.value = ''
  selectedPeriod.value = ''
  startDate.value = ''
  endDate.value = ''
}

function formatReportType(type: string): string {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function formatPeriod(period: string): string {
  return period.charAt(0).toUpperCase() + period.slice(1)
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

function getReportTypeBadgeClass(type: string): string {
  const typeClasses = {
    'income_statement': 'bg-success',
    'balance_sheet': 'bg-primary',
    'portfolio_performance': 'bg-info',
    'transaction_summary': 'bg-warning',
    'goal_progress': 'bg-secondary',
    'tax_report': 'bg-danger'
  }
  return typeClasses[type as keyof typeof typeClasses] || 'bg-secondary'
}

function getStatusBadgeClass(status: string): string {
  const statusClasses = {
    'completed': 'bg-success',
    'generating': 'bg-primary',
    'failed': 'bg-danger',
    'pending': 'bg-warning'
  }
  return statusClasses[status as keyof typeof statusClasses] || 'bg-secondary'
}

async function refreshReports() {
  await reportsStore.loadReport()
}

async function generateReport(report: any) {
  // In the current store structure, we just refresh the report
  await reportsStore.loadReport()
}

async function downloadReport(report: any, format: string) {
  if (format === 'csv') {
    await reportsStore.exportReportAsCSV()
  } else if (format === 'pdf') {
    await reportsStore.exportReportAsPDF()
  }
}

async function exportAllReports(format: string) {
  // For demo, just export the main report
  if (format === 'csv') {
    await reportsStore.exportReportAsCSV()
  } else if (format === 'pdf') {
    await reportsStore.exportReportAsPDF()
  }
}

function viewReport(report: any) {
  // Implementation for viewing report details
}

function editReport(report: any) {
  // Implementation for editing report
}

function duplicateReport(report: any) {
  // Implementation for duplicating report
}

function deleteReport(report: any) {
  if (confirm(`Are you sure you want to delete "${report.title}"?`)) {
    // Implementation for deleting report
  }
}

onMounted(async () => {
  if (!reportsStore.currentReport) {
    await reportsStore.loadReport()
  }
})
</script>

<style scoped>
.report-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.progress {
  border-radius: 4px;
}

.card {
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

@media (max-width: 768px) {
  .report-card {
    margin-bottom: 1rem;
  }
  
  .row.g-3 > .col-md-3,
  .row.g-3 > .col-md-2,
  .row.g-3 > .col-md-1 {
    margin-bottom: 1rem;
  }
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>