<template>
  <div class="modal" :class="{ show: show }" :style="{ display: show ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Sell Bond</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div class="bond-info mb-4">
            <h6 class="mb-3">{{ holding.bondDetails.bondName }}</h6>
            <div class="row g-2">
              <div class="col-6">
                <small class="text-muted">Holdings</small>
                <div class="fw-semibold">{{ holding.quantity }} units</div>
              </div>
              <div class="col-6">
                <small class="text-muted">Avg. Purchase Price</small>
                <div class="fw-semibold">MYR {{ holding.purchasePrice.toFixed(2) }}</div>
              </div>
              <div class="col-6">
                <small class="text-muted">Current Price</small>
                <div class="fw-semibold">MYR {{ holding.bondDetails.currentPrice.toFixed(2) }}</div>
              </div>
              <div class="col-6">
                <small class="text-muted">Current Value</small>
                <div class="fw-semibold">MYR {{ holding.currentValue.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Quantity to Sell</label>
            <input
              type="number"
              v-model.number="quantity"
              class="form-control"
              :max="holding.quantity"
              min="1"
              placeholder="Enter quantity"
              @input="calculateProceeds"
            />
            <small class="text-muted">Maximum: {{ holding.quantity }} units</small>
          </div>

          <div class="mb-3">
            <label class="form-label">Sale Price per Bond (MYR)</label>
            <input
              type="number"
              v-model.number="salePrice"
              class="form-control"
              step="0.01"
              placeholder="Current market price"
              readonly
            />
          </div>

          <div class="order-summary">
            <div class="d-flex justify-content-between mb-2">
              <span>Gross Proceeds:</span>
              <span class="fw-semibold">MYR {{ grossProceeds.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Commission (0.5%):</span>
              <span class="fw-semibold">MYR {{ commission.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="d-flex justify-content-between border-top pt-2 mt-2">
              <span class="fw-bold">Net Proceeds:</span>
              <span class="fw-bold text-primary fs-5">MYR {{ netProceeds.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="d-flex justify-content-between mt-2">
              <span>Profit/Loss:</span>
              <span class="fw-semibold" :class="profitLoss >= 0 ? 'text-success' : 'text-danger'">
                MYR {{ profitLoss.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
          <button 
            type="button" 
            class="btn btn-danger" 
            @click="confirmSale"
            :disabled="!isValidSale"
          >
            Confirm Sale
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop" :class="{ show: show }" v-if="show"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { BondHolding } from '@/stores/bonds'

const props = defineProps<{
  holding: BondHolding
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: { holdingId: string; quantity: number }]
}>()

const quantity = ref(1)
const salePrice = ref(props.holding.bondDetails.currentPrice)

const grossProceeds = computed(() => quantity.value * salePrice.value)
const commission = computed(() => grossProceeds.value * 0.005)
const netProceeds = computed(() => grossProceeds.value - commission.value)

const costBasis = computed(() => {
  const avgCost = props.holding.purchasePrice
  return quantity.value * avgCost
})

const profitLoss = computed(() => netProceeds.value - costBasis.value)

const isValidSale = computed(() => {
  return quantity.value > 0 && quantity.value <= props.holding.quantity
})

watch(() => props.holding, (newHolding) => {
  salePrice.value = newHolding.bondDetails.currentPrice
}, { immediate: true })

function calculateProceeds() {
  // Recalculates automatically via computed properties
}

function close() {
  emit('close')
  quantity.value = 1
}

function confirmSale() {
  if (isValidSale.value) {
    emit('confirm', {
      holdingId: props.holding.id,
      quantity: quantity.value
    })
    quantity.value = 1
  }
}
</script>

<style scoped>
.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.bond-info {
  background: var(--bs-light);
  padding: 1rem;
  border-radius: 0.5rem;
}

.order-summary {
  background: var(--bs-light);
  padding: 1rem;
  border-radius: 0.5rem;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.modal-backdrop.show {
  opacity: 0.5;
}
</style>
