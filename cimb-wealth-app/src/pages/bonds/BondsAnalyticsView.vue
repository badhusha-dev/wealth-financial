<template>
  <div class="bonds-analytics-view">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2>Bond Analytics</h2>
          <p class="text-muted mb-0">Advanced bond calculations and risk metrics</p>
        </div>
      </div>

      <!-- Bond Calculator -->
      <div class="row mb-4">
        <div class="col-md-4 mb-3">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Bond Calculator</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Select Bond</label>
                <select v-model="selectedBondId" class="form-select">
                  <option value="">Choose a bond...</option>
                  <option v-for="bond in bondsStore.marketBonds" :key="bond.id" :value="bond.id">
                    {{ bond.bondName }}
                  </option>
                </select>
              </div>

              <div v-if="selectedBond" class="bond-details">
                <h6 class="mb-3">Bond Information</h6>
                <div class="mb-2">
                  <small class="text-muted">Issuer</small>
                  <div class="fw-semibold">{{ selectedBond.issuer }}</div>
                </div>
                <div class="mb-2">
                  <small class="text-muted">Coupon Rate</small>
                  <div class="fw-semibold">{{ selectedBond.couponRate }}%</div>
                </div>
                <div class="mb-2">
                  <small class="text-muted">Current Price</small>
                  <div class="fw-semibold">MYR {{ selectedBond.currentPrice }}</div>
                </div>
                <div class="mb-2">
                  <small class="text-muted">Maturity Date</small>
                  <div class="fw-semibold">{{ selectedBond.maturityDate }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-8 mb-3" v-if="selectedBond">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Bond Metrics</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 mb-4">
                  <div class="metric-card">
                    <div class="metric-label">Yield to Maturity (YTM)</div>
                    <div class="metric-value">{{ ytm }}%</div>
                    <small class="text-muted">Expected annual return if held to maturity</small>
                  </div>
                </div>
                <div class="col-md-6 mb-4">
                  <div class="metric-card">
                    <div class="metric-label">Macaulay Duration</div>
                    <div class="metric-value">{{ macaulayDuration }} years</div>
                    <small class="text-muted">Weighted average time to receive cash flows</small>
                  </div>
                </div>
                <div class="col-md-6 mb-4">
                  <div class="metric-card">
                    <div class="metric-label">Modified Duration</div>
                    <div class="metric-value">{{ modifiedDuration }}</div>
                    <small class="text-muted">Price sensitivity to yield changes</small>
                  </div>
                </div>
                <div class="col-md-6 mb-4">
                  <div class="metric-card">
                    <div class="metric-label">Convexity</div>
                    <div class="metric-value">{{ convexity }}</div>
                    <small class="text-muted">Curvature of price-yield relationship</small>
                  </div>
                </div>
              </div>

              <div class="alert alert-info mt-3">
                <h6>Understanding Bond Metrics</h6>
                <ul class="mb-0 small">
                  <li><strong>YTM:</strong> Higher YTM indicates higher expected returns</li>
                  <li><strong>Duration:</strong> Longer duration = higher interest rate risk</li>
                  <li><strong>Convexity:</strong> Higher convexity = better price performance in volatile markets</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Portfolio Analytics Charts -->
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Risk vs Return</h5>
            </div>
            <div class="card-body">
              <canvas ref="riskReturnChartRef"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Time to Maturity</h5>
            </div>
            <div class="card-body">
              <canvas ref="maturityChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Yield Curve -->
      <div class="row">
        <div class="col-12 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Government Bond Yield Curve</h5>
            </div>
            <div class="card-body">
              <canvas ref="yieldCurveChartRef"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBondsStore } from '@/stores/bonds'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const bondsStore = useBondsStore()
const selectedBondId = ref('')
const riskReturnChartRef = ref<HTMLCanvasElement | null>(null)
const maturityChartRef = ref<HTMLCanvasElement | null>(null)
const yieldCurveChartRef = ref<HTMLCanvasElement | null>(null)

let riskReturnChart: Chart | null = null
let maturityChart: Chart | null = null
let yieldCurveChart: Chart | null = null

const selectedBond = computed(() => {
  return bondsStore.marketBonds.find(b => b.id === selectedBondId.value)
})

const ytm = computed(() => {
  if (!selectedBond.value) return 0
  return bondsStore.calculateYTM(selectedBond.value)
})

const macaulayDuration = computed(() => {
  if (!selectedBond.value) return 0
  return bondsStore.calculateMacaulayDuration(selectedBond.value)
})

const modifiedDuration = computed(() => {
  if (!selectedBond.value) return 0
  return bondsStore.calculateModifiedDuration(selectedBond.value)
})

const convexity = computed(() => {
  if (!selectedBond.value) return 0
  return bondsStore.calculateConvexity(selectedBond.value)
})

function createCharts() {
  // Risk vs Return Scatter
  if (riskReturnChartRef.value) {
    const ctx = riskReturnChartRef.value.getContext('2d')
    if (ctx) {
      const data = bondsStore.marketBonds.map(bond => ({
        x: getRiskScore(bond.riskLevel),
        y: bond.yield,
        label: bond.bondName
      }))

      riskReturnChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Bonds',
            data: data,
            backgroundColor: '#dc143c',
            borderColor: '#dc143c'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  return `${context.raw.label}: ${context.parsed.y.toFixed(2)}% yield`
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Risk Level'
              },
              ticks: {
                callback: function(value: any) {
                  const riskLabels = ['Very Low', 'Low', 'Moderate', 'High']
                  return riskLabels[value - 1] || ''
                }
              }
            },
            y: {
              title: {
                display: true,
                text: 'Yield (%)'
              }
            }
          }
        }
      })
    }
  }

  // Time to Maturity Bar Chart
  if (maturityChartRef.value) {
    const ctx = maturityChartRef.value.getContext('2d')
    if (ctx) {
      const holdings = bondsStore.bondHoldings
      
      maturityChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: holdings.map(h => h.bondDetails.bondName),
          datasets: [{
            label: 'Years to Maturity',
            data: holdings.map(h => getYearsToMaturity(h.bondDetails.maturityDate)),
            backgroundColor: '#dc143c'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Years'
              }
            }
          }
        }
      })
    }
  }

  // Yield Curve
  if (yieldCurveChartRef.value) {
    const ctx = yieldCurveChartRef.value.getContext('2d')
    if (ctx) {
      const govBonds = bondsStore.marketBonds
        .filter(b => b.bondType === 'Government')
        .sort((a, b) => getYearsToMaturity(a.maturityDate) - getYearsToMaturity(b.maturityDate))

      yieldCurveChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: govBonds.map(b => `${getYearsToMaturity(b.maturityDate).toFixed(1)}Y`),
          datasets: [{
            label: 'Yield',
            data: govBonds.map(b => b.yield),
            borderColor: '#dc143c',
            backgroundColor: 'rgba(220, 20, 60, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time to Maturity'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Yield (%)'
              }
            }
          }
        }
      })
    }
  }
}

function getRiskScore(riskLevel: string): number {
  const riskMap: Record<string, number> = {
    'Very Low': 1,
    'Low': 2,
    'Moderate': 3,
    'Moderate to High': 3.5,
    'High': 4
  }
  return riskMap[riskLevel] || 2
}

function getYearsToMaturity(maturityDate: string): number {
  const today = new Date()
  const maturity = new Date(maturityDate)
  const years = (maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365)
  return Math.max(0, years)
}

onMounted(() => {
  createCharts()
})
</script>

<style scoped>
.bonds-analytics-view {
  min-height: 100vh;
}

.metric-card {
  background: var(--bs-light);
  padding: 1.5rem;
  border-radius: 0.5rem;
  height: 100%;
}

.metric-label {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--cimb-red);
  margin-bottom: 0.5rem;
}

.bond-details {
  background: var(--bs-light);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}
</style>
