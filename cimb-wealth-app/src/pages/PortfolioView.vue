<template>
  <div class="container-fluid p-4">
    <!-- Page Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h2 mb-1 gradient-text font-secondary">Portfolio Overview</h1>
            <p class="text-muted mb-0">Track and manage your investment portfolio</p>
          </div>
          <div class="text-end">
            <button 
              class="btn btn-outline-primary me-2"
              @click="refreshPortfolio"
              :disabled="portfolioStore.loading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': portfolioStore.loading }"></i>
              Refresh
            </button>
            <small class="text-muted d-block">Last updated: {{ new Date().toLocaleString() }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Portfolio Summary Cards -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card glass-card card-animated micro-bounce h-100" style="background: var(--gradient-primary);">
          <div class="card-body text-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Total Value</h6>
                <h4 class="mb-0">{{ formatCurrency(portfolioStore.totalPortfolioValue) }}</h4>
              </div>
              <i class="fas fa-wallet fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card glass-card card-animated micro-bounce h-100" :class="gainLossCardClass">
          <div class="card-body text-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Total Gain/Loss</h6>
                <h4 class="mb-0">{{ formatCurrency(portfolioStore.totalUnrealizedGain) }}</h4>
                <small class="opacity-75">{{ formatPercentage(portfolioStore.totalUnrealizedGainPercent) }}</small>
              </div>
              <i :class="gainLossIcon" class="fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card glass-card card-animated micro-bounce h-100" style="background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%);">
          <div class="card-body text-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Total Holdings</h6>
                <h4 class="mb-0">{{ portfolioStore.userHoldings.length }}</h4>
                <small class="opacity-75">{{ portfolioStore.holdingsByAssetType.length }} asset types</small>
              </div>
              <i class="fas fa-chart-pie fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card glass-card card-animated micro-bounce h-100" style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%);">
          <div class="card-body text-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Sectors</h6>
                <h4 class="mb-0">{{ portfolioStore.holdingsBySector.length }}</h4>
                <small class="opacity-75">Diversified portfolio</small>
              </div>
              <i class="fas fa-layer-group fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Table Row -->
    <div class="row">
      <!-- Sector Allocation Chart -->
      <div class="col-lg-4 mb-4">
        <div class="card glass-card card-animated h-100">
          <div class="card-header glass d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0 font-secondary">Sector Allocation</h5>
            <small class="text-muted">By Value</small>
          </div>
          <div class="card-body">
            <div v-if="portfolioStore.loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="portfolioStore.holdingsBySector.length === 0" class="text-center py-4 text-muted">
              <i class="fas fa-chart-pie fa-3x mb-3 opacity-50"></i>
              <p>No portfolio data available</p>
            </div>
            <div v-else>
              <!-- Chart Canvas -->
              <div class="chart-container" style="position: relative; height: 300px; width: 100%;">
                <canvas ref="sectorChartCanvas" id="sectorChart"></canvas>
              </div>
              <!-- Legend -->
              <div class="mt-3">
                <div 
                  v-for="(sector, index) in portfolioStore.holdingsBySector.slice(0, 6)" 
                  :key="sector.sector"
                  class="d-flex justify-content-between align-items-center py-1 small"
                >
                  <div class="d-flex align-items-center">
                    <div 
                      class="legend-color me-2"
                      :style="{ backgroundColor: chartColors[index] }"
                    ></div>
                    <span>{{ sector.sector }}</span>
                  </div>
                  <div class="text-end">
                    <div class="fw-medium">{{ formatPercentage(sector.percentage) }}</div>
                    <div class="text-muted small">{{ formatCurrency(sector.value) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Portfolio Holdings Table -->
      <div class="col-lg-8 mb-4">
        <div class="card glass-card card-animated h-100">
          <div class="card-header glass d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0 font-secondary">Holdings</h5>
            <div class="d-flex align-items-center gap-3">
              <CompactToggle 
                v-model="isCompactView" 
                label="Compact"
              />
              <input 
                type="text" 
                class="form-control form-control-sm glass" 
                placeholder="Search holdings..." 
                style="width: 200px;"
                v-model="searchQuery"
                @input="handleSearchChange"
              >
              <select class="form-select form-select-sm glass" style="width: 150px;" v-model="selectedSector" @change="handleSectorChange">
                <option value="">All Sectors</option>
                <option 
                  v-for="sector in portfolioStore.holdingsBySector" 
                  :key="sector.sector" 
                  :value="sector.sector"
                >
                  {{ sector.sector }}
                </option>
              </select>
            </div>
          </div>
          <div class="card-body p-0">
            <div v-if="portfolioStore.loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <!-- AG-Grid Holdings Table -->
            <div class="ag-grid-container" style="height: 500px;">
              <AgGridVue
                class="ag-theme-alpine glass-grid"
                :columnDefs="columnDefs"
                :rowData="portfolioStore.userHoldings"
                :gridOptions="gridOptions"
                :pagination="true"
                :paginationPageSize="isCompactView ? 15 : 10"
              >
              </AgGridVue>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { Chart, type ChartConfiguration, registerables } from 'chart.js'
import { AgGridVue } from 'ag-grid-vue3'
import CompactToggle from '@/components/CompactToggle.vue'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

Chart.register(...registerables)

const portfolioStore = usePortfolioStore()

// Table filtering
const searchQuery = ref('')
const selectedSector = ref('')
const isCompactView = ref(false)

// AG-Grid configuration
let gridApi: any = null

const columnDefs = ref([
  {
    headerName: 'Symbol',
    field: 'ticker',
    width: 100,
    pinned: 'left' as const,
    cellClass: 'fw-bold',
    sortable: true,
    filter: 'agTextColumnFilter'
  },
  {
    headerName: 'Name',
    field: 'name',
    width: 200,
    sortable: true,
    filter: 'agTextColumnFilter',
    valueGetter: (params: any) => `${params.data.name} (${params.data.assetType})`
  },
  {
    headerName: 'Sector',
    field: 'sector',
    width: 120,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellStyle: (params: any) => {
      const color = getSectorColor(params.data.sector)
      return {
        backgroundColor: color,
        color: 'white',
        borderRadius: '15px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '0.75rem'
      }
    }
  },
  {
    headerName: 'Quantity',
    field: 'quantity',
    width: 110,
    type: 'rightAligned',
    sortable: true,
    filter: 'agNumberColumnFilter',
    valueFormatter: (params: any) => formatNumber(params.value)
  },
  {
    headerName: 'Current Price',
    field: 'currentPrice',
    width: 130,
    type: 'rightAligned',
    sortable: true,
    filter: 'agNumberColumnFilter',
    valueFormatter: (params: any) => formatCurrency(params.value, params.data.currency)
  },
  {
    headerName: 'Total Value',
    field: 'totalValue',
    width: 130,
    type: 'rightAligned',
    sortable: true,
    filter: 'agNumberColumnFilter',
    cellClass: 'fw-medium',
    valueFormatter: (params: any) => formatCurrency(params.value, params.data.currency)
  },
  {
    headerName: 'Gain/Loss',
    field: 'unrealizedGain',
    width: 150,
    type: 'rightAligned',
    sortable: true,
    filter: 'agNumberColumnFilter',
    valueFormatter: (params: any) => {
      const gain = params.data.unrealizedGain
      const gainPercent = params.data.unrealizedGainPercent
      return `${formatCurrency(gain, params.data.currency)} (${formatPercentage(gainPercent)})`
    },
    cellStyle: (params: any) => {
      const gain = params.data.unrealizedGain
      return {
        color: gain > 0 ? '#28a745' : gain < 0 ? '#dc3545' : '#6c757d',
        fontWeight: 'bold'
      }
    }
  }
])

const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  flex: 1,
  minWidth: 100
}

// Grid options
const gridOptions = computed(() => ({
  defaultColDef: defaultColDef,
  rowHeight: isCompactView.value ? 32 : 48,
  headerHeight: isCompactView.value ? 32 : 40,
  animateRows: true,
  suppressCellFocus: true,
  rowSelection: 'single',
  enableRangeSelection: false,
  enableCellTextSelection: false,
  suppressRowClickSelection: false,
  onGridReady: onGridReady
}))

// Watch for compact mode changes
watch(isCompactView, () => {
  if (gridApi) {
    gridApi.setRowHeight(isCompactView.value ? 32 : 48)
    gridApi.setHeaderHeight(isCompactView.value ? 32 : 40)
    gridApi.resetRowHeights()
  }
})

// Chart
const sectorChartCanvas = ref<HTMLCanvasElement>()
let sectorChart: Chart | null = null

// Chart colors
const chartColors = [
  '#dc3545', // CIMB Red
  '#fd7e14', // Orange
  '#ffc107', // Yellow  
  '#28a745', // Green
  '#17a2b8', // Teal
  '#6f42c1', // Purple
  '#e83e8c', // Pink
  '#6c757d', // Gray
  '#007bff', // Blue
  '#20c997', // Cyan
]

// AG-Grid event handlers
function onGridReady(params: any) {
  gridApi = params.api
  
  // Apply quick filter based on search query
  if (searchQuery.value) {
    gridApi.setQuickFilter(searchQuery.value)
  }
}

// Watch for search changes
function applySearch() {
  if (gridApi) {
    gridApi.setQuickFilter(searchQuery.value)
  }
}

// Watch for sector filter changes
function applySectorFilter() {
  if (gridApi) {
    if (selectedSector.value) {
      gridApi.setFilterModel({
        sector: {
          type: 'set',
          values: [selectedSector.value]
        }
      })
    } else {
      gridApi.setFilterModel(null)
    }
  }
}

const gainLossCardClass = computed(() => {
  if (portfolioStore.totalUnrealizedGain > 0) return 'bg-success text-white'
  if (portfolioStore.totalUnrealizedGain < 0) return 'bg-danger text-white'
  return 'bg-secondary text-white'
})

const gainLossIcon = computed(() => {
  if (portfolioStore.totalUnrealizedGain > 0) return 'fas fa-arrow-up'
  if (portfolioStore.totalUnrealizedGain < 0) return 'fas fa-arrow-down'
  return 'fas fa-minus'
})

// Watch search and filter changes
function handleSearchChange() {
  applySearch()
}

function handleSectorChange() {
  applySectorFilter()
}

function getSectorColor(sector: string): string {
  const index = portfolioStore.holdingsBySector.findIndex(s => s.sector === sector)
  return chartColors[index % chartColors.length]
}

async function refreshPortfolio() {
  await portfolioStore.loadPortfolio() // Fix: use loadPortfolio instead of refreshPortfolio
  await createSectorChart()
  
  // Refresh AG-Grid data
  if (gridApi) {
    gridApi.setRowData(portfolioStore.userHoldings)
  }
}

function formatCurrency(amount: number, currency = 'MYR'): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency,
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

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-MY').format(value)
}

async function createSectorChart() {
  if (!sectorChartCanvas.value || portfolioStore.holdingsBySector.length === 0) return

  // Destroy existing chart
  if (sectorChart) {
    sectorChart.destroy()
  }

  const ctx = sectorChartCanvas.value.getContext('2d')!
  
  const data = portfolioStore.holdingsBySector.slice(0, 10) // Top 10 sectors
  
  const config: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: data.map(s => s.sector),
      datasets: [{
        data: data.map(s => s.value),
        backgroundColor: chartColors.slice(0, data.length),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const sector = data[context.dataIndex]
              return `${sector.sector}: ${formatCurrency(sector.value)} (${formatPercentage(sector.percentage)})`
            }
          }
        }
      }
    }
  }

  sectorChart = new Chart(ctx, config)
}

onMounted(async () => {
  if (!portfolioStore.userHoldings.length) {
    await portfolioStore.loadPortfolio()
  }
  
  await nextTick()
  await createSectorChart()
})

// AgGridVue is automatically available due to import
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  user-select: none;
}

.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;
}

.table th {
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 2px solid var(--bs-border-color);
}

.table-hover tbody tr:hover {
  background-color: var(--bs-light);
}

.card {
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.chart-container {
  max-height: 300px;
}

.ag-grid-container {
  width: 100%;
  height: 500px;
}

.ag-theme-alpine {
  --ag-header-background-color: var(--bs-dark);
  --ag-header-foreground-color: white;
  --ag-row-hover-color: var(--bs-light);
  --ag-selected-row-background-color: var(--bs-primary);
}

@media (max-width: 768px) {
  .ag-grid-container {
    height: 400px;
    font-size: 0.875rem;
  }
}
</style>