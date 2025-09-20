<template>
  <div class="market-ticker glass">
    <div class="ticker-header">
      <i class="fas fa-chart-line text-success me-2"></i>
      <span class="ticker-title">Market Updates</span>
      <span class="ticker-time">{{ currentTime }}</span>
    </div>
    <div class="ticker-container">
      <div class="ticker-content" ref="tickerContent">
        <div 
          v-for="(stock, index) in stocks" 
          :key="stock.symbol"
          class="ticker-item"
          :class="{ 
            'positive': stock.change > 0, 
            'negative': stock.change < 0,
            'neutral': stock.change === 0 
          }"
        >
          <span class="symbol">{{ stock.symbol }}</span>
          <span class="price">${{ stock.price.toFixed(2) }}</span>
          <span class="change" :class="stock.change >= 0 ? 'text-success' : 'text-danger'">
            <i :class="stock.change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{ Math.abs(stock.change).toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  volume: string
}

const currentTime = ref('')
const tickerContent = ref<HTMLElement>()

// Dummy stock data - in real app this would come from an API
const stocks = ref<Stock[]>([
  { symbol: 'AAPL', name: 'Apple Inc.', price: 182.25, change: 2.34, volume: '45.2M' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 328.60, change: 1.89, volume: '28.7M' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.85, change: -0.75, volume: '22.1M' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.30, change: 3.21, volume: '31.4M' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.17, change: -1.45, volume: '67.8M' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 485.20, change: 4.67, volume: '42.3M' },
  { symbol: 'META', name: 'Meta Platforms', price: 325.89, change: 2.10, volume: '18.9M' },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 441.22, change: -0.89, volume: '8.7M' },
  { symbol: 'AMD', name: 'AMD Inc.', price: 108.75, change: 1.33, volume: '52.1M' },
  { symbol: 'CRM', name: 'Salesforce Inc.', price: 218.45, change: 0.78, volume: '6.2M' }
])

let timeInterval: number
let priceUpdateInterval: number

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const updatePrices = () => {
  // Simulate real-time price updates
  stocks.value.forEach(stock => {
    // Random price fluctuation (±2%)
    const fluctuation = (Math.random() - 0.5) * 0.04 // ±2%
    const newPrice = stock.price * (1 + fluctuation)
    const changePercent = ((newPrice - stock.price) / stock.price) * 100
    
    stock.price = newPrice
    stock.change = changePercent
    
    // Update volume randomly
    const volumeChange = Math.random() * 0.1 - 0.05 // ±5%
    const currentVolume = parseFloat(stock.volume.replace('M', ''))
    const newVolume = currentVolume * (1 + volumeChange)
    stock.volume = `${newVolume.toFixed(1)}M`
  })
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // Update prices every 5 seconds for demo
  priceUpdateInterval = setInterval(updatePrices, 5000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (priceUpdateInterval) clearInterval(priceUpdateInterval)
})
</script>

<style scoped>
.market-ticker {
  margin-bottom: 1.5rem;
  padding: 0;
  overflow: hidden;
  position: relative;
}

.ticker-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--gradient-glass);
  border-bottom: 1px solid var(--glass-border);
  font-weight: 500;
}

.ticker-title {
  font-family: var(--font-secondary);
  font-weight: 600;
  color: var(--bs-body-color);
}

.ticker-time {
  margin-left: auto;
  font-size: 0.875rem;
  color: var(--text-muted);
  font-family: 'Courier New', monospace;
}

.ticker-container {
  position: relative;
  height: 50px;
  overflow: hidden;
  background: var(--glass-bg);
}

.ticker-content {
  display: flex;
  align-items: center;
  height: 100%;
  animation: scroll-left 60s linear infinite;
  white-space: nowrap;
  padding: 0 1rem;
}

.ticker-item {
  display: inline-flex;
  align-items: center;
  margin-right: 3rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-fast);
  padding: 0.25rem 0.75rem;
  border-radius: var(--border-radius-md);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ticker-item:hover {
  background: var(--gradient-primary-soft);
  transform: scale(1.05);
}

.ticker-item.positive {
  border-color: rgba(40, 167, 69, 0.3);
}

.ticker-item.negative {
  border-color: rgba(220, 53, 69, 0.3);
}

.symbol {
  font-weight: 700;
  color: var(--bs-body-color);
  margin-right: 0.5rem;
  font-family: var(--font-secondary);
}

.price {
  color: var(--bs-body-color);
  margin-right: 0.5rem;
  font-family: 'Courier New', monospace;
}

.change {
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.change i {
  font-size: 0.7rem;
}

/* Smooth scrolling animation */
@keyframes scroll-left {
  0% { 
    transform: translateX(100%); 
  }
  100% { 
    transform: translateX(-100%); 
  }
}

/* Pause animation on hover */
.ticker-container:hover .ticker-content {
  animation-play-state: paused;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .ticker-header {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .ticker-container {
    height: 45px;
  }
  
  .ticker-item {
    margin-right: 2rem;
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
  }
  
  .ticker-content {
    animation-duration: 45s;
  }
}

/* Dark mode adjustments */
[data-theme="dark"] .ticker-item {
  background: rgba(30, 41, 59, 0.3);
  border-color: rgba(148, 163, 184, 0.1);
}

[data-theme="dark"] .ticker-item:hover {
  background: rgba(220, 20, 60, 0.2);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .ticker-content {
    animation: none;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
  }
  
  .ticker-item {
    flex-shrink: 0;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .ticker-item {
    border-width: 2px;
  }
  
  .ticker-item.positive {
    border-color: #28a745;
  }
  
  .ticker-item.negative {
    border-color: #dc3545;
  }
}
</style>