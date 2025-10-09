<template>
  <div class="unit-trusts-view">
    <!-- Summary Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
              <i class="fas fa-chart-pie text-primary fs-4 me-3"></i>
              <div>
                <h6 class="text-muted mb-0">Total Investment</h6>
                <h3 class="mb-0">RM {{ totalValue.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
              <i class="fas fa-coins text-success fs-4 me-3"></i>
              <div>
                <h6 class="text-muted mb-0">Total Funds</h6>
                <h3 class="mb-0">{{ unitTrustsStore.unitTrusts.length }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
              <i :class="['fas', totalUnrealizedGain >= 0 ? 'fa-arrow-trend-up text-success' : 'fa-arrow-trend-down text-danger', 'fs-4 me-3']"></i>
              <div>
                <h6 class="text-muted mb-0">Unrealized Gain/Loss</h6>
                <h3 :class="['mb-0', totalUnrealizedGain >= 0 ? 'text-success' : 'text-danger']">
                  RM {{ totalUnrealizedGain.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
              <i :class="['fas fa-percentage', totalUnrealizedGainPercent >= 0 ? 'text-success' : 'text-danger', 'fs-4 me-3']"></i>
              <div>
                <h6 class="text-muted mb-0">Return %</h6>
                <h3 :class="['mb-0', totalUnrealizedGainPercent >= 0 ? 'text-success' : 'text-danger']">
                  {{ totalUnrealizedGainPercent >= 0 ? '+' : '' }}{{ totalUnrealizedGainPercent.toFixed(2) }}%
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mb-4">
      <button class="btn btn-primary me-2" @click="showBuyModal = true">
        <i class="fas fa-plus me-2"></i>Buy Fund
      </button>
      <button class="btn btn-outline-secondary me-2" @click="showSellModal = true">
        <i class="fas fa-minus me-2"></i>Sell Fund
      </button>
      <button class="btn btn-outline-info" @click="showSwitchModal = true">
        <i class="fas fa-exchange-alt me-2"></i>Switch Fund
      </button>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'holdings' }" @click="activeTab = 'holdings'" href="javascript:void(0)">
          <i class="fas fa-briefcase me-2"></i>My Holdings
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'performance' }" @click="activeTab = 'performance'" href="javascript:void(0)">
          <i class="fas fa-chart-line me-2"></i>Performance
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'allocation' }" @click="activeTab = 'allocation'" href="javascript:void(0)">
          <i class="fas fa-chart-pie me-2"></i>Asset Allocation
        </a>
      </li>
    </ul>

    <!-- Holdings Tab -->
    <div v-if="activeTab === 'holdings'">
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Fund Name</th>
                  <th>Type</th>
                  <th>Risk</th>
                  <th class="text-end">Units</th>
                  <th class="text-end">NAV Price</th>
                  <th class="text-end">Avg Cost</th>
                  <th class="text-end">Current Value</th>
                  <th class="text-end">Gain/Loss</th>
                  <th class="text-end">Return %</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ut in unitTrustsStore.unitTrusts" :key="ut.id">
                  <td>
                    <div>
                      <div class="fw-medium">{{ ut.fundName }}</div>
                      <small class="text-muted">{{ ut.fundCode }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-info">{{ ut.fundType }}</span>
                  </td>
                  <td>
                    <span :class="getRiskBadgeClass(ut.riskLevel)">{{ ut.riskLevel }}</span>
                  </td>
                  <td class="text-end">{{ ut.units.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</td>
                  <td class="text-end">{{ ut.navPrice.toFixed(4) }}</td>
                  <td class="text-end">{{ ut.averageCost.toFixed(4) }}</td>
                  <td class="text-end fw-medium">RM {{ ut.currentValue.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</td>
                  <td :class="['text-end fw-medium', ut.unrealizedGain >= 0 ? 'text-success' : 'text-danger']">
                    {{ ut.unrealizedGain >= 0 ? '+' : '' }}RM {{ ut.unrealizedGain.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}
                  </td>
                  <td :class="['text-end fw-medium', ut.unrealizedGainPercent >= 0 ? 'text-success' : 'text-danger']">
                    {{ ut.unrealizedGainPercent >= 0 ? '+' : '' }}{{ ut.unrealizedGainPercent.toFixed(2) }}%
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary" @click="viewDetails(ut)">
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Tab -->
    <div v-if="activeTab === 'performance'">
      <div class="row">
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0"><i class="fas fa-trophy me-2"></i>Top Performers</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Fund</th>
                      <th class="text-end">YTD</th>
                      <th class="text-end">1 Year</th>
                      <th class="text-end">3 Year</th>
                      <th class="text-end">5 Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ut in unitTrustsStore.topPerformers" :key="ut.id">
                      <td>
                        <div class="fw-medium">{{ ut.fundName }}</div>
                        <small class="text-muted">{{ ut.fundCode }}</small>
                      </td>
                      <td class="text-end text-success">+{{ ut.yearToDateReturn }}%</td>
                      <td class="text-end text-success">+{{ ut.oneYearReturn }}%</td>
                      <td class="text-end text-success">+{{ ut.threeYearReturn }}%</td>
                      <td class="text-end text-success">+{{ ut.fiveYearReturn }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0"><i class="fas fa-shield-alt me-2"></i>Risk Distribution</h5>
            </div>
            <div class="card-body">
              <div v-for="(funds, risk) in unitTrustsStore.byRiskLevel" :key="risk" class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span :class="getRiskBadgeClass(risk)">{{ risk }}</span>
                  <span class="fw-medium">{{ funds.length }} fund(s)</span>
                </div>
                <div class="progress" style="height: 8px;">
                  <div 
                    class="progress-bar" 
                    :class="getRiskProgressClass(risk)"
                    :style="{ width: (funds.length / unitTrustsStore.unitTrusts.length * 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Allocation Tab -->
    <div v-if="activeTab === 'allocation'">
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0"><i class="fas fa-chart-pie me-2"></i>Asset Allocation by Fund Type</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-lg-8">
              <canvas ref="allocationChart"></canvas>
            </div>
            <div class="col-lg-4">
              <div v-for="allocation in unitTrustsStore.assetAllocation" :key="allocation.type" class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-medium">{{ allocation.type }}</span>
                  <span class="text-muted">{{ allocation.percentage.toFixed(1) }}%</span>
                </div>
                <div class="mb-1">
                  <small class="text-muted">RM {{ allocation.value.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</small>
                </div>
                <div class="progress" style="height: 8px;">
                  <div class="progress-bar bg-primary" :style="{ width: allocation.percentage + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fund Details Modal -->
    <div v-if="selectedFund" class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedFund.fundName }}</h5>
            <button type="button" class="btn-close" @click="selectedFund = null"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Fund Code</label>
                <div class="fw-medium">{{ selectedFund.fundCode }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Fund Manager</label>
                <div class="fw-medium">{{ selectedFund.fundManager }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Category</label>
                <div class="fw-medium">{{ selectedFund.category }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Risk Level</label>
                <div><span :class="getRiskBadgeClass(selectedFund.riskLevel)">{{ selectedFund.riskLevel }}</span></div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Inception Date</label>
                <div class="fw-medium">{{ formatDate(selectedFund.inceptionDate) }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Purchase Date</label>
                <div class="fw-medium">{{ formatDate(selectedFund.purchaseDate) }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Annual Management Fee</label>
                <div class="fw-medium">{{ selectedFund.annualManagementFee }}%</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Sales Charge</label>
                <div class="fw-medium">{{ selectedFund.salesCharge }}%</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Minimum Investment</label>
                <div class="fw-medium">RM {{ selectedFund.minimumInvestment.toLocaleString('en-MY') }}</div>
              </div>
              <div class="col-md-6 mb-3">
                <label class="text-muted small">Current NAV</label>
                <div class="fw-medium">{{ selectedFund.navPrice.toFixed(4) }}</div>
              </div>
            </div>
            
            <h6 class="mt-4 mb-3">Performance Returns</h6>
            <div class="row">
              <div class="col-6 col-md-3 mb-3 text-center">
                <div class="text-muted small">YTD</div>
                <div class="fs-5 fw-bold text-success">+{{ selectedFund.yearToDateReturn }}%</div>
              </div>
              <div class="col-6 col-md-3 mb-3 text-center">
                <div class="text-muted small">1 Year</div>
                <div class="fs-5 fw-bold text-success">+{{ selectedFund.oneYearReturn }}%</div>
              </div>
              <div class="col-6 col-md-3 mb-3 text-center">
                <div class="text-muted small">3 Years</div>
                <div class="fs-5 fw-bold text-success">+{{ selectedFund.threeYearReturn }}%</div>
              </div>
              <div class="col-6 col-md-3 mb-3 text-center">
                <div class="text-muted small">5 Years</div>
                <div class="fs-5 fw-bold text-success">+{{ selectedFund.fiveYearReturn }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Buy Modal -->
    <div v-if="showBuyModal" class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Buy Unit Trust</h5>
            <button type="button" class="btn-close" @click="showBuyModal = false"></button>
          </div>
          <div class="modal-body">
            <p class="alert alert-info"><i class="fas fa-info-circle me-2"></i>This is a demo feature. No actual transactions will be processed.</p>
            <div class="mb-3">
              <label class="form-label">Select Fund</label>
              <select class="form-select" v-model="buyForm.fundCode">
                <option value="">Choose a fund...</option>
                <option v-for="ut in unitTrustsStore.unitTrusts" :key="ut.fundCode" :value="ut.fundCode">
                  {{ ut.fundName }} ({{ ut.fundCode }})
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Amount (RM)</label>
              <input type="number" class="form-control" v-model.number="buyForm.amount" min="0" step="100">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showBuyModal = false">Cancel</button>
            <button type="button" class="btn btn-primary" @click="handleBuy">Buy Fund</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sell Modal -->
    <div v-if="showSellModal" class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Sell Unit Trust</h5>
            <button type="button" class="btn-close" @click="showSellModal = false"></button>
          </div>
          <div class="modal-body">
            <p class="alert alert-info"><i class="fas fa-info-circle me-2"></i>This is a demo feature. No actual transactions will be processed.</p>
            <div class="mb-3">
              <label class="form-label">Select Fund</label>
              <select class="form-select" v-model="sellForm.fundId">
                <option value="">Choose a fund...</option>
                <option v-for="ut in unitTrustsStore.unitTrusts" :key="ut.id" :value="ut.id">
                  {{ ut.fundName }} ({{ ut.units.toFixed(2) }} units)
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Units to Sell</label>
              <input type="number" class="form-control" v-model.number="sellForm.units" min="0" step="0.01">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showSellModal = false">Cancel</button>
            <button type="button" class="btn btn-danger" @click="handleSell">Sell Fund</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Switch Modal -->
    <div v-if="showSwitchModal" class="modal show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Switch Unit Trust</h5>
            <button type="button" class="btn-close" @click="showSwitchModal = false"></button>
          </div>
          <div class="modal-body">
            <p class="alert alert-info"><i class="fas fa-info-circle me-2"></i>This is a demo feature. No actual transactions will be processed.</p>
            <div class="mb-3">
              <label class="form-label">From Fund</label>
              <select class="form-select" v-model="switchForm.fromId">
                <option value="">Choose a fund...</option>
                <option v-for="ut in unitTrustsStore.unitTrusts" :key="ut.id" :value="ut.id">
                  {{ ut.fundName }} ({{ ut.units.toFixed(2) }} units)
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">To Fund</label>
              <select class="form-select" v-model="switchForm.toFundCode">
                <option value="">Choose a fund...</option>
                <option v-for="ut in unitTrustsStore.unitTrusts" :key="ut.fundCode" :value="ut.fundCode">
                  {{ ut.fundName }} ({{ ut.fundCode }})
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Amount (RM)</label>
              <input type="number" class="form-control" v-model.number="switchForm.amount" min="0" step="100">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showSwitchModal = false">Cancel</button>
            <button type="button" class="btn btn-info" @click="handleSwitch">Switch Fund</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useUnitTrustsStore } from '@/stores/unitTrusts'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const unitTrustsStore = useUnitTrustsStore()
const activeTab = ref('holdings')
const selectedFund = ref(null)
const allocationChart = ref(null)
let chartInstance: Chart | null = null

const showBuyModal = ref(false)
const showSellModal = ref(false)
const showSwitchModal = ref(false)

const buyForm = ref({
  fundCode: '',
  amount: 1000
})

const sellForm = ref({
  fundId: '',
  units: 0
})

const switchForm = ref({
  fromId: '',
  toFundCode: '',
  amount: 0
})

const totalValue = computed(() => unitTrustsStore.totalValue)
const totalUnrealizedGain = computed(() => unitTrustsStore.totalUnrealizedGain)
const totalUnrealizedGainPercent = computed(() => unitTrustsStore.totalUnrealizedGainPercent)

function getRiskBadgeClass(risk: string) {
  const classes: Record<string, string> = {
    'Very Low': 'badge bg-success',
    'Low': 'badge bg-info',
    'Moderate': 'badge bg-warning',
    'High': 'badge bg-orange text-white',
    'Very High': 'badge bg-danger'
  }
  return classes[risk] || 'badge bg-secondary'
}

function getRiskProgressClass(risk: string) {
  const classes: Record<string, string> = {
    'Very Low': 'bg-success',
    'Low': 'bg-info',
    'Moderate': 'bg-warning',
    'High': 'bg-orange',
    'Very High': 'bg-danger'
  }
  return classes[risk] || 'bg-secondary'
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-MY', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

function viewDetails(fund: any) {
  selectedFund.value = fund
}

function handleBuy() {
  if (buyForm.value.fundCode && buyForm.value.amount > 0) {
    unitTrustsStore.buyUnitTrust(buyForm.value.fundCode, buyForm.value.amount)
    showBuyModal.value = false
    buyForm.value = { fundCode: '', amount: 1000 }
  }
}

function handleSell() {
  if (sellForm.value.fundId && sellForm.value.units > 0) {
    unitTrustsStore.sellUnitTrust(sellForm.value.fundId, sellForm.value.units)
    showSellModal.value = false
    sellForm.value = { fundId: '', units: 0 }
  }
}

function handleSwitch() {
  if (switchForm.value.fromId && switchForm.value.toFundCode && switchForm.value.amount > 0) {
    unitTrustsStore.switchUnitTrust(switchForm.value.fromId, switchForm.value.toFundCode, switchForm.value.amount)
    showSwitchModal.value = false
    switchForm.value = { fromId: '', toFundCode: '', amount: 0 }
  }
}

function createAllocationChart() {
  if (chartInstance) {
    chartInstance.destroy()
  }

  const allocation = unitTrustsStore.assetAllocation
  
  if (allocationChart.value) {
    chartInstance = new Chart(allocationChart.value as HTMLCanvasElement, {
      type: 'doughnut',
      data: {
        labels: allocation.map(a => a.type),
        datasets: [{
          data: allocation.map(a => a.value),
          backgroundColor: [
            '#dc143c',
            '#ff6384',
            '#36a2eb',
            '#ffce56',
            '#4bc0c0',
            '#9966ff',
            '#ff9f40'
          ]
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
                const percentage = allocation[context.dataIndex].percentage.toFixed(1)
                return `${label}: RM ${value.toLocaleString('en-MY')} (${percentage}%)`
              }
            }
          }
        }
      }
    })
  }
}

onMounted(() => {
  nextTick(() => {
    if (activeTab.value === 'allocation') {
      createAllocationChart()
    }
  })
})
</script>

<style scoped>
.nav-link {
  cursor: pointer;
}

.bg-orange {
  background-color: #ff9f40 !important;
}

.modal.show {
  display: block;
}
</style>
