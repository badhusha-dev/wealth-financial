<template>
  <div class="container-fluid p-4">
    <!-- Page Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h2 mb-1">Transaction History</h1>
            <p class="text-muted mb-0">View and manage all your financial transactions</p>
          </div>
          <div class="text-end">
            <button 
              class="btn btn-outline-primary me-2"
              @click="refreshTransactions"
              :disabled="transactionsStore.loading"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': transactionsStore.loading }"></i>
              Refresh
            </button>
            <small class="text-muted d-block">Last updated: {{ new Date().toLocaleString() }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card bg-success text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Total Income</h6>
                <h4 class="mb-0">{{ formatCurrency(transactionsStore.totalIncome) }}</h4>
                <small class="opacity-75">All time</small>
              </div>
              <i class="fas fa-arrow-down fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card bg-danger text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Total Expenses</h6>
                <h4 class="mb-0">{{ formatCurrency(transactionsStore.totalExpenses) }}</h4>
                <small class="opacity-75">All time</small>
              </div>
              <i class="fas fa-arrow-up fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card bg-primary text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Net Cash Flow</h6>
                <h4 class="mb-0">{{ formatCurrency(transactionsStore.totalIncome - transactionsStore.totalExpenses) }}</h4>
                <small class="opacity-75">All time balance</small>
              </div>
              <i class="fas fa-balance-scale fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card bg-info text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="card-title mb-1">Total Transactions</h6>
                <h4 class="mb-0">{{ transactionsStore.userTransactions.length }}</h4>
                <small class="opacity-75">{{ transactionsStore.categories.length }} categories</small>
              </div>
              <i class="fas fa-list fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row g-3 align-items-end">
              <div class="col-md-3">
                <label class="form-label">Search Transactions</label>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Search description, reference..." 
                  v-model="searchQuery"
                  @input="handleSearchChange"
                >
              </div>
              <div class="col-md-2">
                <label class="form-label">Category</label>
                <select class="form-select" v-model="selectedCategory" @change="handleCategoryChange">
                  <option value="">All Categories</option>
                  <option v-for="category in transactionsStore.categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label">Type</label>
                <select class="form-select" v-model="selectedType" @change="handleTypeChange">
                  <option value="">All Types</option>
                  <option value="credit">Income</option>
                  <option value="debit">Expense</option>
                  <option value="neutral">Transfer</option>
                </select>
              </div>
              <div class="col-md-2">
                <label class="form-label">From Date</label>
                <input 
                  type="date" 
                  class="form-control" 
                  v-model="startDate"
                  @change="handleDateChange"
                >
              </div>
              <div class="col-md-2">
                <label class="form-label">To Date</label>
                <input 
                  type="date" 
                  class="form-control" 
                  v-model="endDate"
                  @change="handleDateChange"
                >
              </div>
              <div class="col-md-1">
                <button 
                  class="btn btn-outline-secondary w-100" 
                  @click="clearAllFilters"
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

    <!-- Transactions Table -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">All Transactions</h5>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-secondary">{{ filteredTransactionCount }} transactions</span>
              <button class="btn btn-sm btn-outline-success" @click="exportTransactions">
                <i class="fas fa-download"></i>
                Export CSV
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div v-if="transactionsStore.loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else>
              <!-- AG-Grid Transactions Table -->
              <div class="ag-grid-container" style="height: 600px;">
                <AgGridVue
                  class="ag-theme-alpine"
                  :columnDefs="columnDefs"
                  :rowData="transactionsStore.userTransactions"
                  :defaultColDef="defaultColDef"
                  :animateRows="true"
                  :pagination="true"
                  :paginationPageSize="20"
                  :suppressCellFocus="true"
                  :rowSelection="'multiple'"
                  @grid-ready="onGridReady"
                  @selection-changed="onSelectionChanged"
                >
                </AgGridVue>
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
import { useTransactionsStore } from '@/stores/transactions'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const transactionsStore = useTransactionsStore()

// Filters
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedType = ref('')
const startDate = ref('')
const endDate = ref('')

// AG-Grid configuration
let gridApi: any = null
const selectedRows = ref<any[]>([])

const columnDefs = ref([
  {
    headerName: 'Date',
    field: 'date',
    width: 120,
    pinned: 'left',
    sortable: true,
    filter: 'agDateColumnFilter',
    filterParams: {
      comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
        const cellDate = new Date(cellValue)
        if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
          return 0
        }
        if (cellDate < filterLocalDateAtMidnight) {
          return -1
        }
        if (cellDate > filterLocalDateAtMidnight) {
          return 1
        }
        return 0
      }
    },
    valueFormatter: (params: any) => new Date(params.value).toLocaleDateString(),
    sort: 'desc' // Default sort by date descending
  },
  {
    headerName: 'Description',
    field: 'description',
    width: 250,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'fw-medium'
  },
  {
    headerName: 'Category',
    field: 'category',
    width: 140,
    sortable: true,
    filter: 'agSetColumnFilter',
    cellStyle: {
      backgroundColor: '#f8f9fa',
      fontWeight: '600',
      fontSize: '0.875rem'
    }
  },
  {
    headerName: 'Type',
    field: 'type',
    width: 100,
    sortable: true,
    filter: 'agSetColumnFilter',
    valueFormatter: (params: any) => {
      const typeMap = {
        'credit': 'Income',
        'debit': 'Expense', 
        'neutral': 'Transfer'
      }
      return typeMap[params.value as keyof typeof typeMap] || params.value
    },
    cellStyle: (params: any) => {
      const colorMap = {
        'credit': { backgroundColor: '#d4edda', color: '#155724' },
        'debit': { backgroundColor: '#f8d7da', color: '#721c24' },
        'neutral': { backgroundColor: '#d1ecf1', color: '#0c5460' }
      }
      return colorMap[params.value as keyof typeof colorMap] || {}
    }
  },
  {
    headerName: 'Amount',
    field: 'amount',
    width: 130,
    type: 'rightAligned',
    sortable: true,
    filter: 'agNumberColumnFilter',
    valueFormatter: (params: any) => {
      const amount = Math.abs(params.value)
      return formatCurrency(amount, params.data.currency)
    },
    cellStyle: (params: any) => {
      const type = params.data.type
      return {
        fontWeight: 'bold',
        color: type === 'credit' ? '#28a745' : type === 'debit' ? '#dc3545' : '#6c757d'
      }
    }
  },
  {
    headerName: 'Balance',
    field: 'balance',
    width: 130,
    type: 'rightAligned',
    sortable: true,
    filter: 'agNumberColumnFilter',
    cellClass: 'text-muted',
    valueFormatter: (params: any) => formatCurrency(params.value, params.data.currency)
  },
  {
    headerName: 'Reference',
    field: 'reference',
    width: 150,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellClass: 'text-muted small'
  },
  {
    headerName: 'Status',
    field: 'status',
    width: 120,
    sortable: true,
    filter: 'agSetColumnFilter',
    valueFormatter: (params: any) => {
      return params.value.charAt(0).toUpperCase() + params.value.slice(1)
    },
    cellStyle: (params: any) => {
      const statusColors = {
        'completed': { backgroundColor: '#d4edda', color: '#155724' },
        'pending': { backgroundColor: '#fff3cd', color: '#856404' },
        'failed': { backgroundColor: '#f8d7da', color: '#721c24' }
      }
      return statusColors[params.value as keyof typeof statusColors] || {}
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

const filteredTransactionCount = computed(() => {
  if (!gridApi) return transactionsStore.userTransactions.length
  return gridApi.getDisplayedRowCount()
})

// AG-Grid event handlers
function onGridReady(params: any) {
  gridApi = params.api
  applyAllFilters()
}

function onSelectionChanged() {
  if (gridApi) {
    selectedRows.value = gridApi.getSelectedRows()
  }
}

// Filter handlers
function handleSearchChange() {
  applySearchFilter()
}

function handleCategoryChange() {
  applyCategoryFilter()
}

function handleTypeChange() {
  applyTypeFilter()
}

function handleDateChange() {
  applyDateFilter()
}

function applySearchFilter() {
  if (gridApi) {
    gridApi.setQuickFilter(searchQuery.value)
  }
}

function applyCategoryFilter() {
  if (gridApi) {
    if (selectedCategory.value) {
      gridApi.setFilterModel({
        ...gridApi.getFilterModel(),
        category: {
          filterType: 'set',
          values: [selectedCategory.value]
        }
      })
    } else {
      const filterModel = gridApi.getFilterModel()
      delete filterModel.category
      gridApi.setFilterModel(filterModel)
    }
  }
}

function applyTypeFilter() {
  if (gridApi) {
    if (selectedType.value) {
      gridApi.setFilterModel({
        ...gridApi.getFilterModel(),
        type: {
          filterType: 'set',
          values: [selectedType.value]
        }
      })
    } else {
      const filterModel = gridApi.getFilterModel()
      delete filterModel.type
      gridApi.setFilterModel(filterModel)
    }
  }
}

function applyDateFilter() {
  if (gridApi && (startDate.value || endDate.value)) {
    let dateFilter: any
    
    if (startDate.value && endDate.value) {
      // Both dates provided - use range filter
      dateFilter = {
        filterType: 'date',
        type: 'inRange',
        dateFrom: startDate.value,
        dateTo: endDate.value
      }
    } else if (startDate.value) {
      // Only start date - use greater than or equal
      dateFilter = {
        filterType: 'date',
        type: 'greaterThanOrEqual',
        dateFrom: startDate.value
      }
    } else if (endDate.value) {
      // Only end date - use less than or equal
      dateFilter = {
        filterType: 'date',
        type: 'lessThanOrEqual',
        dateFrom: endDate.value
      }
    }
    
    if (dateFilter) {
      gridApi.setFilterModel({
        ...gridApi.getFilterModel(),
        date: dateFilter
      })
    }
  } else if (gridApi) {
    const filterModel = gridApi.getFilterModel()
    delete filterModel.date
    gridApi.setFilterModel(filterModel)
  }
}

function applyAllFilters() {
  applySearchFilter()
  applyCategoryFilter()
  applyTypeFilter()
  applyDateFilter()
}

function clearAllFilters() {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedType.value = ''
  startDate.value = ''
  endDate.value = ''
  
  if (gridApi) {
    gridApi.setFilterModel(null)
    gridApi.setQuickFilter('')
  }
}

async function refreshTransactions() {
  await transactionsStore.loadTransactions()
  if (gridApi) {
    gridApi.setRowData(transactionsStore.userTransactions)
  }
}

function exportTransactions() {
  if (gridApi) {
    gridApi.exportDataAsCsv({
      fileName: `transactions_${new Date().toISOString().split('T')[0]}.csv`
    })
  }
}

function formatCurrency(amount: number, currency = 'MYR'): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

onMounted(async () => {
  if (!transactionsStore.userTransactions.length) {
    await transactionsStore.loadTransactions()
  }
})
</script>

<style scoped>
.ag-grid-container {
  width: 100%;
  height: 600px;
}

.ag-theme-alpine {
  --ag-header-background-color: var(--bs-dark);
  --ag-header-foreground-color: white;
  --ag-row-hover-color: var(--bs-light);
  --ag-selected-row-background-color: var(--cimb-red);
  --ag-range-selection-background-color: rgba(220, 20, 60, 0.1);
}

.card {
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

@media (max-width: 768px) {
  .ag-grid-container {
    height: 500px;
    font-size: 0.875rem;
  }
  
  .row.g-3 > .col-md-3,
  .row.g-3 > .col-md-2,
  .row.g-3 > .col-md-1 {
    margin-bottom: 1rem;
  }
}
</style>