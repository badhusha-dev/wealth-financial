<template>
  <div class="my-bonds-view">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2>My Bond Portfolio</h2>
          <p class="text-muted mb-0">Track your bond investments and performance</p>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card">
            <div class="card-body">
              <h6 class="text-muted mb-2">Total Portfolio Value</h6>
              <h3 class="mb-0">MYR {{ bondsStore.totalPortfolioValue.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card">
            <div class="card-body">
              <h6 class="text-muted mb-2">Total Investment</h6>
              <h3 class="mb-0">MYR {{ bondsStore.totalInvestment.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card">
            <div class="card-body">
              <h6 class="text-muted mb-2">Unrealized Gain/Loss</h6>
              <h3 class="mb-0" :class="bondsStore.totalUnrealizedGain >= 0 ? 'text-success' : 'text-danger'">
                MYR {{ bondsStore.totalUnrealizedGain.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}
              </h3>
              <small :class="bondsStore.totalUnrealizedGain >= 0 ? 'text-success' : 'text-danger'">
                {{ ((bondsStore.totalUnrealizedGain / bondsStore.totalInvestment) * 100).toFixed(2) }}%
              </small>
            </div>
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <div class="card">
            <div class="card-body">
              <h6 class="text-muted mb-2">Portfolio Yield</h6>
              <h3 class="mb-0">{{ bondsStore.portfolioYield.toFixed(2) }}%</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Bond Holdings Table -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Bond Holdings</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Bond Name</th>
                      <th>Quantity</th>
                      <th>Purchase Price</th>
                      <th>Current Price</th>
                      <th>Investment</th>
                      <th>Current Value</th>
                      <th>Gain/Loss</th>
                      <th>Yield</th>
                      <th>Next Coupon</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="holding in bondsStore.bondHoldings" :key="holding.id">
                      <td>
                        <router-link :to="`/bonds/${holding.bondDetails.id}`" class="text-decoration-none">
                          <strong>{{ holding.bondDetails.bondName }}</strong>
                          <br>
                          <small class="text-muted">{{ holding.bondDetails.isin }}</small>
                        </router-link>
                      </td>
                      <td>{{ holding.quantity }}</td>
                      <td>{{ holding.purchasePrice.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</td>
                      <td>{{ holding.bondDetails.currentPrice.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</td>
                      <td>{{ holding.totalInvestment.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</td>
                      <td>{{ holding.currentValue.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</td>
                      <td :class="holding.unrealizedGain >= 0 ? 'text-success' : 'text-danger'">
                        {{ holding.unrealizedGain.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}
                        <br>
                        <small>({{ holding.unrealizedGainPercent.toFixed(2) }}%)</small>
                      </td>
                      <td>{{ holding.bondDetails.yield.toFixed(2) }}%</td>
                      <td>{{ formatDate(holding.nextCouponDate) }}</td>
                      <td>
                        <button 
                          class="btn btn-sm btn-outline-danger"
                          @click="openSellModal(holding)"
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bond Allocation Charts -->
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Allocation by Type</h5>
            </div>
            <div class="card-body">
              <canvas ref="typeChartRef"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Allocation by Rating</h5>
            </div>
            <div class="card-body">
              <canvas ref="ratingChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sell Bond Modal -->
    <SellBondModal
      v-if="selectedHolding"
      :holding="selectedHolding"
      :show="showSellModal"
      @close="closeSellModal"
      @confirm="handleSellBond"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useBondsStore } from '@/stores/bonds'
import type { BondHolding } from '@/stores/bonds'
import { Chart, registerables } from 'chart.js'
import SellBondModal from './components/SellBondModal.vue'

Chart.register(...registerables)

const bondsStore = useBondsStore()
const typeChartRef = ref<HTMLCanvasElement | null>(null)
const ratingChartRef = ref<HTMLCanvasElement | null>(null)
const selectedHolding = ref<BondHolding | null>(null)
const showSellModal = ref(false)

let typeChart: Chart | null = null
let ratingChart: Chart | null = null

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })
}

function createCharts() {
  if (typeChartRef.value) {
    const ctx = typeChartRef.value.getContext('2d')
    if (ctx) {
      typeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: bondsStore.bondAllocationByType.map(a => a.type),
          datasets: [{
            data: bondsStore.bondAllocationByType.map(a => a.value),
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || ''
                  const value = context.parsed || 0
                  const percentage = bondsStore.bondAllocationByType[context.dataIndex].percentage.toFixed(2)
                  return `${label}: MYR ${value.toLocaleString('en-MY', { minimumFractionDigits: 2 })} (${percentage}%)`
                }
              }
            }
          }
        }
      })
    }
  }

  if (ratingChartRef.value) {
    const ctx = ratingChartRef.value.getContext('2d')
    if (ctx) {
      ratingChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: bondsStore.bondAllocationByRating.map(a => a.rating),
          datasets: [{
            data: bondsStore.bondAllocationByRating.map(a => a.value),
            backgroundColor: ['#10b981', '#059669', '#3b82f6', '#f59e0b', '#f97316', '#ef4444']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || ''
                  const value = context.parsed || 0
                  const percentage = bondsStore.bondAllocationByRating[context.dataIndex].percentage.toFixed(2)
                  return `${label}: MYR ${value.toLocaleString('en-MY', { minimumFractionDigits: 2 })} (${percentage}%)`
                }
              }
            }
          }
        }
      })
    }
  }
}

function openSellModal(holding: BondHolding) {
  selectedHolding.value = holding
  showSellModal.value = true
}

function closeSellModal() {
  showSellModal.value = false
  selectedHolding.value = null
}

function handleSellBond(data: { holdingId: string; quantity: number }) {
  const success = bondsStore.sellBond(data.holdingId, data.quantity)
  if (success) {
    console.log('Bond sold successfully')
    updateCharts()
  }
  closeSellModal()
}

function updateCharts() {
  if (typeChart) {
    typeChart.data.labels = bondsStore.bondAllocationByType.map(a => a.type)
    typeChart.data.datasets[0].data = bondsStore.bondAllocationByType.map(a => a.value)
    typeChart.update()
  }

  if (ratingChart) {
    ratingChart.data.labels = bondsStore.bondAllocationByRating.map(a => a.rating)
    ratingChart.data.datasets[0].data = bondsStore.bondAllocationByRating.map(a => a.value)
    ratingChart.update()
  }
}

watch(() => bondsStore.bondHoldings, () => {
  updateCharts()
}, { deep: true })

onMounted(() => {
  createCharts()
})
</script>

<style scoped>
.my-bonds-view {
  min-height: 100vh;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.table td {
  vertical-align: middle;
  font-weight: 500;
}
</style>
