<template>
  <div 
    class="game-badge" 
    :class="[`badge-${type}`, { 'badge-earned': earned, 'badge-locked': !earned }]"
    :title="description"
  >
    <div class="badge-icon">
      <i :class="icon" :style="{ color: iconColor }"></i>
      <div v-if="earned" class="badge-shine"></div>
    </div>
    <div class="badge-info">
      <div class="badge-title">{{ title }}</div>
      <div class="badge-description">{{ description }}</div>
      <div v-if="progress !== undefined" class="badge-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ 
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: progressColor 
            }"
          ></div>
        </div>
        <span class="progress-text">{{ Math.round(progress) }}%</span>
      </div>
    </div>
    <div v-if="earned" class="badge-checkmark">
      <i class="fas fa-check"></i>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  description: string
  icon: string
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  earned: boolean
  progress?: number // 0-100, optional progress bar
  category?: string
}

const props = defineProps<Props>()

const iconColor = computed(() => {
  if (!props.earned) return 'var(--bs-secondary)'
  
  switch (props.type) {
    case 'bronze': return '#cd7f32'
    case 'silver': return '#c0c0c0'
    case 'gold': return '#ffd700'
    case 'platinum': return '#e5e4e2'
    case 'diamond': return '#b9f2ff'
    default: return 'var(--cimb-red)'
  }
})

const progressColor = computed(() => {
  switch (props.type) {
    case 'bronze': return '#cd7f32'
    case 'silver': return '#c0c0c0'
    case 'gold': return '#ffd700'
    case 'platinum': return '#e5e4e2'
    case 'diamond': return '#b9f2ff'
    default: return 'var(--cimb-red)'
  }
})
</script>

<style scoped>
.game-badge {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.game-badge:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.badge-icon {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-right: 1rem;
  border-radius: 50%;
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  transition: all var(--transition-base);
}

.badge-earned .badge-icon {
  animation: badgeEarnedPulse 2s ease-in-out infinite;
}

.badge-locked .badge-icon {
  opacity: 0.5;
  filter: grayscale(100%);
}

.badge-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 3s ease-in-out infinite;
  pointer-events: none;
}

.badge-info {
  flex: 1;
}

.badge-title {
  font-family: var(--font-secondary);
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--bs-body-color);
  margin-bottom: 0.25rem;
}

.badge-description {
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.badge-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bs-border-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width var(--transition-base);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progressShine 2s ease-in-out infinite;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  min-width: 35px;
  text-align: right;
}

.badge-checkmark {
  width: 30px;
  height: 30px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
  margin-left: 0.75rem;
  animation: checkmarkBounce 0.6s ease-out;
}

/* Badge type specific styles */
.badge-bronze.badge-earned {
  border-color: rgba(205, 127, 50, 0.3);
  box-shadow: 0 0 20px rgba(205, 127, 50, 0.2);
}

.badge-silver.badge-earned {
  border-color: rgba(192, 192, 192, 0.3);
  box-shadow: 0 0 20px rgba(192, 192, 192, 0.2);
}

.badge-gold.badge-earned {
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.badge-platinum.badge-earned {
  border-color: rgba(229, 228, 226, 0.3);
  box-shadow: 0 0 20px rgba(229, 228, 226, 0.2);
}

.badge-diamond.badge-earned {
  border-color: rgba(185, 242, 255, 0.3);
  box-shadow: 0 0 20px rgba(185, 242, 255, 0.2);
}

/* Animations */
@keyframes badgeEarnedPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

@keyframes progressShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes checkmarkBounce {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Locked state */
.badge-locked {
  opacity: 0.6;
}

.badge-locked .badge-title,
.badge-locked .badge-description {
  color: var(--text-muted);
}

/* Dark mode adjustments */
[data-theme="dark"] .badge-icon {
  background: var(--glass-bg);
}

[data-theme="dark"] .progress-bar {
  background: var(--bs-border-color);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .game-badge {
    padding: 0.75rem;
  }
  
  .badge-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
    margin-right: 0.75rem;
  }
  
  .badge-title {
    font-size: 1rem;
  }
  
  .badge-description {
    font-size: 0.8rem;
  }
  
  .badge-checkmark {
    width: 25px;
    height: 25px;
    font-size: 0.75rem;
    margin-left: 0.5rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .badge-icon,
  .badge-checkmark,
  .progress-fill,
  .badge-shine {
    animation: none;
  }
  
  .game-badge:hover {
    transform: none;
  }
}
</style>