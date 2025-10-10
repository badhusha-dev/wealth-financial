<template>
  <div class="modal" :class="{ show: show }" :style="{ display: show ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Buy Bond</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body">
          <div class="bond-info mb-4">
            <h6 class="mb-3">{{ bond.bondName }}</h6>
            <div class="row g-2">
              <div class="col-6">
                <small class="text-muted">Issuer</small>
                <div class="fw-semibold">{{ bond.issuer }}</div>
              </div>
              <div class="col-6">
                <small class="text-muted">Rating</small>
                <div class="fw-semibold" :style="{ color: getRatingColor(bond.rating) }">{{ bond.rating }}</div>
              </div>
              <div class="col-6">
                <small class="text-muted">Coupon Rate</small>
                <div class="fw-semibold">{{ bond.couponRate }}%</div>
              </div>
              <div class="col-6">
                <small class="text-muted">Current Yield</small>
                <div class="fw-semibold">{{ bond.yield }}%</div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Quantity (Face Value: MYR {{ bond.faceValue }})</label>
            <input
              type="number"
              v-model.number="quantity"
              class="form-control"
              min="1"
              placeholder="Enter quantity"
              @input="calculateTotal"
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Price per Bond (MYR)</label>
            <input
              type="number"
              v-model.number="price"
              class="form-control"
              step="0.01"
              placeholder="Current market price"
              readonly
            />
          </div>

          <div class="order-summary">
            <div class="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span class="fw-semibold">MYR {{ subtotal.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span>Commission (0.5%):</span>
              <span class="fw-semibold">MYR {{ commission.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="d-flex justify-content-between border-top pt-2 mt-2">
              <span class="fw-bold">Total Cost:</span>
              <span class="fw-bold text-primary fs-5">MYR {{ totalCost.toLocaleString('en-MY', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>

          <div class="alert alert-info mt-3 small">
            <i class="fas fa-info-circle me-2"></i>
            Minimum investment: MYR {{ bond.minimumInvestment.toLocaleString('en-MY') }}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="confirmPurchase"
            :disabled="!isValidOrder"
          >
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop" :class="{ show: show }" v-if="show"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Bond } from '@/stores/bonds'

const props = defineProps<{
  bond: Bond
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [data: { bond: Bond; quantity: number; price: number }]
}>()

const quantity = ref(1)
const price = ref(props.bond.currentPrice)

const subtotal = computed(() => quantity.value * price.value)
const commission = computed(() => subtotal.value * 0.005)
const totalCost = computed(() => subtotal.value + commission.value)

const isValidOrder = computed(() => {
  return quantity.value > 0 && totalCost.value >= props.bond.minimumInvestment
})

watch(() => props.bond, (newBond) => {
  price.value = newBond.currentPrice
}, { immediate: true })

function calculateTotal() {
  // Recalculates automatically via computed properties
}

function getRatingColor(rating: string): string {
  const ratingColors: Record<string, string> = {
    'AAA': '#10b981',
    'AA': '#059669',
    'A': '#3b82f6',
    'BBB': '#f59e0b',
    'BB': '#f97316',
    'B': '#ef4444'
  }
  return ratingColors[rating] || '#6b7280'
}

function close() {
  emit('close')
  quantity.value = 1
}

function confirmPurchase() {
  if (isValidOrder.value) {
    emit('confirm', {
      bond: props.bond,
      quantity: quantity.value,
      price: price.value
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
