<template>
  <div class="fab-container">
    <!-- FAB Menu Items -->
    <transition-group 
      name="fab-menu" 
      tag="div" 
      class="fab-menu" 
      :class="{ open: isOpen }"
    >
      <div
        v-for="(action, index) in actions"
        :key="action.id"
        class="fab-item"
        :style="{ transitionDelay: `${index * 50}ms` }"
        @click="handleAction(action)"
        :title="action.label"
      >
        <i :class="action.icon"></i>
      </div>
    </transition-group>

    <!-- Main FAB Button -->
    <button
      class="fab"
      @click="toggleMenu"
      :class="{ active: isOpen }"
      aria-label="Quick Actions"
    >
      <i class="fas" :class="isOpen ? 'fa-times' : 'fa-plus'"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface FabAction {
  id: string
  label: string
  icon: string
  action: string
  color?: string
}

const router = useRouter()
const isOpen = ref(false)

const actions: FabAction[] = [
  {
    id: 'add-goal',
    label: 'Add Goal',
    icon: 'fas fa-bullseye',
    action: 'add-goal',
    color: '#28a745'
  },
  {
    id: 'export-report',
    label: 'Export Report',
    icon: 'fas fa-download',
    action: 'export-report',
    color: '#007bff'
  },
  {
    id: 'quick-transaction',
    label: 'Quick Transaction',
    icon: 'fas fa-exchange-alt',
    action: 'quick-transaction',
    color: '#17a2b8'
  },
  {
    id: 'portfolio-analysis',
    label: 'Portfolio Analysis',
    icon: 'fas fa-chart-line',
    action: 'portfolio-analysis',
    color: '#fd7e14'
  }
]

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const handleAction = (action: FabAction) => {
  // Close menu first
  isOpen.value = false
  
  // Handle different actions
  switch (action.action) {
    case 'add-goal':
      router.push('/goals')
      // Trigger add goal modal/form
      break
    case 'export-report':
      router.push('/reports')
      // Trigger export functionality
      break
    case 'quick-transaction':
      router.push('/transactions')
      // Could open a quick transaction modal
      break
    case 'portfolio-analysis':
      router.push('/3d-viz')
      break
    default:
      console.log('Unknown action:', action.action)
  }
}

// Close menu when clicking outside
const closeMenu = () => {
  isOpen.value = false
}

// Auto-close on route change
router.beforeEach(() => {
  isOpen.value = false
})
</script>

<style scoped>
.fab-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.fab {
  width: var(--fab-size);
  height: var(--fab-size);
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  border: none;
  box-shadow: var(--shadow-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  z-index: 1001;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-2xl);
}

.fab.active {
  transform: rotate(45deg);
}

.fab-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.fab-item {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  color: var(--bs-body-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: 1.1rem;
  box-shadow: var(--shadow-md);
  transform: scale(0) translateY(20px);
  opacity: 0;
}

.fab-menu.open .fab-item {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.fab-item:hover {
  background: var(--gradient-primary);
  color: white;
  transform: scale(1.1) translateY(0);
  box-shadow: var(--shadow-lg);
}

/* Staggered animation for menu items */
.fab-menu-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fab-menu-leave-active {
  transition: all 0.2s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.fab-menu-enter-from {
  opacity: 0;
  transform: scale(0) translateY(20px);
}

.fab-menu-leave-to {
  opacity: 0;
  transform: scale(0) translateY(-10px);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .fab-container {
    bottom: 20px;
    right: 20px;
  }
  
  .fab {
    width: 52px;
    height: 52px;
    font-size: 1.3rem;
  }
  
  .fab-item {
    width: 44px;
    height: 44px;
    font-size: 1rem;
  }
}

/* Accessibility */
.fab:focus,
.fab-item:focus {
  outline: 2px solid var(--cimb-red);
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .fab,
  .fab-item {
    transition: none;
  }
  
  .fab.active {
    transform: none;
  }
}
</style>