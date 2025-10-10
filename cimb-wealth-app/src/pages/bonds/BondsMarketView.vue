<template>
  <div class="bonds-market-view">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2>Bond Market Explorer</h2>
          <p class="text-muted mb-0">Discover and invest in government and corporate bonds</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <label class="form-label">Bond Type</label>
          <select v-model="filters.bondType" class="form-select">
            <option value="">All Types</option>
            <option value="Government">Government</option>
            <option value="Corporate">Corporate</option>
          </select>
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Rating</label>
          <select v-model="filters.rating" class="form-select">
            <option value="">All Ratings</option>
            <option value="AAA">AAA</option>
            <option value="AA">AA</option>
            <option value="A">A</option>
            <option value="BBB">BBB</option>
          </select>
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Risk Level</label>
          <select v-model="filters.riskLevel" class="form-select">
            <option value="">All Risk Levels</option>
            <option value="Very Low">Very Low</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="Moderate to High">Moderate to High</option>
            <option value="High">High</option>
          </select>
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label">Sector</label>
          <select v-model="filters.sector" class="form-select">
            <option value="">All Sectors</option>
            <option v-for="sector in uniqueSectors" :key="sector" :value="sector">{{ sector }}</option>
          </select>
        </div>
      </div>

      <!-- AG-Grid Table -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <ag-grid-vue
                class="ag-theme-alpine"
                style="height: 600px; width: 100%;"
                :rowData="filteredBonds"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :pagination="true"
                :paginationPageSize="20"
                @grid-ready="onGridReady"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Buy Bond Modal -->
    <BuyBondModal
      v-if="selectedBond"
      :bond="selectedBond"
      :show="showBuyModal"
      @close="closeBuyModal"
      @confirm="handleBuyBond"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { useBondsStore } from '@/stores/bonds'
import type { Bond } from '@/stores/bonds'
import { ColDef } from 'ag-grid-community'
import BuyBondModal from './components/BuyBondModal.vue'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const bondsStore = useBondsStore()

const filters = ref({
  bondType: '',
  rating: '',
  riskLevel: '',
  sector: ''
})

const selectedBond = ref<Bond | null>(null)
const showBuyModal = ref(false)

const uniqueSectors = computed(() => {
  const sectors = new Set(bondsStore.marketBonds.map(b => b.sector))
  return Array.from(sectors).sort()
})

const filteredBonds = computed(() => {
  return bondsStore.marketBonds.filter(bond => {
    if (filters.value.bondType && bond.bondType !== filters.value.bondType) return false
    if (filters.value.rating && bond.rating !== filters.value.rating) return false
    if (filters.value.riskLevel && bond.riskLevel !== filters.value.riskLevel) return false
    if (filters.value.sector && bond.sector !== filters.value.sector) return false
    return true
  })
})

const columnDefs = ref<ColDef[]>([
  {
    headerName: 'Bond Name',
    field: 'bondName',
    sortable: true,
    filter: true,
    width: 200,
    pinned: 'left'
  },
  {
    headerName: 'ISIN',
    field: 'isin',
    sortable: true,
    filter: true,
    width: 150
  },
  {
    headerName: 'Issuer',
    field: 'issuer',
    sortable: true,
    filter: true,
    width: 200
  },
  {
    headerName: 'Type',
    field: 'bondType',
    sortable: true,
    filter: true,
    width: 120,
    cellStyle: (params: any) => {
      return params.value === 'Government' 
        ? { color: '#10b981', fontWeight: '600' } 
        : { color: '#3b82f6', fontWeight: '600' }
    }
  },
  {
    headerName: 'Rating',
    field: 'rating',
    sortable: true,
    filter: true,
    width: 100,
    cellStyle: (params: any) => {
      const ratingColors: Record<string, string> = {
        'AAA': '#10b981',
        'AA': '#059669',
        'A': '#3b82f6',
        'BBB': '#f59e0b',
        'BB': '#f97316',
        'B': '#ef4444'
      }
      return { 
        color: ratingColors[params.value] || '#6b7280',
        fontWeight: '700'
      }
    }
  },
  {
    headerName: 'Coupon %',
    field: 'couponRate',
    sortable: true,
    filter: 'agNumberColumnFilter',
    width: 120,
    valueFormatter: (params: any) => `${params.value.toFixed(2)}%`
  },
  {
    headerName: 'Price (MYR)',
    field: 'currentPrice',
    sortable: true,
    filter: 'agNumberColumnFilter',
    width: 130,
    valueFormatter: (params: any) => params.value.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  },
  {
    headerName: 'Yield %',
    field: 'yield',
    sortable: true,
    filter: 'agNumberColumnFilter',
    width: 110,
    valueFormatter: (params: any) => `${params.value.toFixed(2)}%`,
    cellStyle: { fontWeight: '600' }
  },
  {
    headerName: 'Maturity Date',
    field: 'maturityDate',
    sortable: true,
    filter: 'agDateColumnFilter',
    width: 140
  },
  {
    headerName: 'Risk Level',
    field: 'riskLevel',
    sortable: true,
    filter: true,
    width: 150
  },
  {
    headerName: 'Action',
    field: 'id',
    width: 120,
    cellRenderer: (params: any) => {
      return '<button class="btn btn-sm btn-primary">Buy</button>'
    },
    onCellClicked: (params: any) => {
      openBuyModal(params.data)
    }
  }
])

const defaultColDef = ref<ColDef>({
  resizable: true,
  sortable: true
})

function onGridReady() {
  console.log('AG-Grid is ready')
}

function openBuyModal(bond: Bond) {
  selectedBond.value = bond
  showBuyModal.value = true
}

function closeBuyModal() {
  showBuyModal.value = false
  selectedBond.value = null
}

function handleBuyBond(data: { bond: Bond; quantity: number; price: number }) {
  const success = bondsStore.buyBond(data.bond.id, data.quantity, data.price)
  if (success) {
    console.log('Bond purchased successfully')
  }
  closeBuyModal()
}

onMounted(() => {
  console.log('Bonds Market loaded with', bondsStore.marketBonds.length, 'bonds')
})
</script>

<style scoped>
.bonds-market-view {
  min-height: 100vh;
}

.form-label {
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.form-select {
  font-weight: 500;
}

:deep(.ag-theme-alpine) {
  --ag-font-family: 'Inter', sans-serif;
  --ag-font-size: 14px;
}

:deep(.ag-header-cell-text) {
  font-weight: 600;
}

:deep(.ag-cell) {
  display: flex;
  align-items: center;
}
</style>
