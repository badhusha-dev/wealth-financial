<template>
  <div class="circular-progress" :style="{ width: size + 'px', height: size + 'px' }">
    <svg 
      :width="size" 
      :height="size" 
      class="progress-ring"
      viewBox="0 0 120 120"
    >
      <!-- Background circle -->
      <circle
        cx="60"
        cy="60"
        :r="radius"
        stroke="rgba(0, 0, 0, 0.1)"
        :stroke-width="strokeWidth"
        fill="none"
        class="progress-ring-bg"
      />
      
      <!-- Progress circle -->
      <circle
        cx="60"
        cy="60"
        :r="radius"
        :stroke="color"
        :stroke-width="strokeWidth"
        fill="none"
        class="progress-ring-progress"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        :stroke-linecap="strokeLinecap"
        transform="rotate(-90 60 60)"
      />
      
      <!-- Glow effect -->
      <circle
        v-if="glow"
        cx="60"
        cy="60"
        :r="radius"
        :stroke="color"
        :stroke-width="strokeWidth * 0.5"
        fill="none"
        class="progress-ring-glow"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        :stroke-linecap="strokeLinecap"
        transform="rotate(-90 60 60)"
        opacity="0.3"
      />
    </svg>
    
    <!-- Center content -->
    <div class="progress-content">
      <div v-if="showPercentage" class="progress-percentage">
        <span class="percentage-number" ref="percentageRef">{{ Math.round(value) }}%</span>
      </div>
      <div v-if="label" class="progress-label">{{ label }}</div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ThemeUtils from '@/utils/theme'

interface Props {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  strokeLinecap?: 'round' | 'square' | 'butt'
  showPercentage?: boolean
  label?: string
  animationDuration?: number
  glow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 120,
  strokeWidth: 8,
  color: 'var(--cimb-red)',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  strokeLinecap: 'round',
  showPercentage: true,
  label: '',
  animationDuration: 1500,
  glow: false
})

const percentageRef = ref<HTMLElement>()
const animatedValue = ref(0)

const radius = computed(() => (props.size / 2) - (props.strokeWidth / 2) - 10)
const circumference = computed(() => 2 * Math.PI * radius.value)

const strokeDashoffset = computed(() => {
  const progress = Math.max(0, Math.min(100, animatedValue.value))
  return circumference.value - (progress / 100) * circumference.value
})

// Animate to target value
const animateProgress = () => {
  if (!ThemeUtils.prefersReducedMotion()) {
    const startValue = animatedValue.value
    const endValue = props.value
    const duration = props.animationDuration
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (easeOutCubic)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      animatedValue.value = startValue + (endValue - startValue) * easeOut
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  } else {
    animatedValue.value = props.value
  }
}

// Animate percentage counter
const animatePercentage = () => {
  if (percentageRef.value && props.showPercentage && !ThemeUtils.prefersReducedMotion()) {
    ThemeUtils.animateCounter(
      percentageRef.value,
      0,
      props.value,
      props.animationDuration,
      (value) => `${Math.round(value)}%`
    )
  }
}

onMounted(() => {
  setTimeout(() => {
    animateProgress()
    if (props.showPercentage) {
      animatePercentage()
    }
  }, 100)
})

watch(() => props.value, () => {
  animateProgress()
  if (props.showPercentage) {
    animatePercentage()
  }
})
</script>

<style scoped>
.circular-progress {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(0deg);
  transition: all var(--transition-base);
}

.progress-ring-bg {
  stroke: var(--bs-border-color);
  opacity: 0.3;
}

.progress-ring-progress {
  transition: stroke-dashoffset var(--transition-slow) cubic-bezier(0.25, 0.46, 0.45, 0.94);
  filter: drop-shadow(0 0 6px currentColor);
}

.progress-ring-glow {
  transition: stroke-dashoffset var(--transition-slow) cubic-bezier(0.25, 0.46, 0.45, 0.94);
  filter: blur(3px);
}

.progress-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 70%;
  height: 70%;
}

.progress-percentage {
  font-family: var(--font-secondary);
  font-weight: 700;
  color: var(--bs-body-color);
}

.percentage-number {
  font-size: 1.5rem;
  line-height: 1;
}

.progress-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

/* Size variants */
.circular-progress[style*="width: 80px"] .percentage-number {
  font-size: 1rem;
}

.circular-progress[style*="width: 60px"] .percentage-number {
  font-size: 0.875rem;
}

.circular-progress[style*="width: 40px"] .percentage-number {
  font-size: 0.75rem;
}

/* Color variants */
.progress-ring-progress[stroke*="28a745"] {
  filter: drop-shadow(0 0 8px #28a745);
}

.progress-ring-progress[stroke*="ffc107"] {
  filter: drop-shadow(0 0 8px #ffc107);
}

.progress-ring-progress[stroke*="dc3545"] {
  filter: drop-shadow(0 0 8px #dc3545);
}

/* Dark mode adjustments */
[data-theme="dark"] .progress-ring-bg {
  stroke: var(--bs-border-color);
  opacity: 0.2;
}

[data-theme="dark"] .progress-percentage {
  color: var(--bs-body-color);
}

[data-theme="dark"] .progress-label {
  color: var(--text-muted);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .progress-ring-progress,
  .progress-ring-glow {
    transition: none;
  }
}
</style>