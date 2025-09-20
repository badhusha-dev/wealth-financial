<template>
  <div class="compact-toggle">
    <label class="toggle-label">
      <span class="toggle-text">{{ label }}</span>
      <div class="toggle-switch" :class="{ active: modelValue }" @click="toggleValue">
        <div class="toggle-slider">
          <div class="toggle-handle"></div>
        </div>
        <div class="toggle-icons">
          <i class="fas fa-th-large" :class="{ active: !modelValue }"></i>
          <i class="fas fa-list" :class="{ active: modelValue }"></i>
        </div>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Compact View'
})

const emit = defineEmits<Emits>()

const toggleValue = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped>
.compact-toggle {
  display: inline-flex;
  align-items: center;
  user-select: none;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  margin: 0;
}

.toggle-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--bs-body-color);
  transition: color var(--transition-fast);
}

.toggle-switch {
  position: relative;
  width: 60px;
  height: 30px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: 15px;
  cursor: pointer;
  transition: all var(--transition-base);
  overflow: hidden;
}

.toggle-switch:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.toggle-switch.active {
  background: var(--gradient-primary-soft);
  border-color: var(--cimb-red);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 26px;
  height: 26px;
  background: white;
  border-radius: 50%;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(30px);
  background: var(--cimb-red);
  color: white;
}

.toggle-handle {
  width: 12px;
  height: 12px;
  background: var(--bs-secondary);
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.toggle-switch.active .toggle-handle {
  background: white;
}

.toggle-icons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  pointer-events: none;
}

.toggle-icons i {
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0.5;
  transition: all var(--transition-fast);
}

.toggle-icons i.active {
  opacity: 1;
  color: var(--cimb-red);
}

.toggle-switch.active .toggle-icons i.active {
  color: white;
}

/* Dark mode adjustments */
[data-theme="dark"] .toggle-slider {
  background: var(--bs-gray-700);
}

[data-theme="dark"] .toggle-switch.active .toggle-slider {
  background: var(--cimb-red);
}

[data-theme="dark"] .toggle-handle {
  background: var(--bs-gray-400);
}

/* Accessibility */
.toggle-label:focus-within .toggle-switch {
  outline: 2px solid var(--cimb-red);
  outline-offset: 2px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .toggle-switch {
    width: 50px;
    height: 26px;
    border-radius: 13px;
  }
  
  .toggle-slider {
    width: 22px;
    height: 22px;
  }
  
  .toggle-switch.active .toggle-slider {
    transform: translateX(24px);
  }
  
  .toggle-handle {
    width: 10px;
    height: 10px;
  }
  
  .toggle-icons {
    padding: 0 6px;
  }
  
  .toggle-icons i {
    font-size: 0.65rem;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .toggle-switch,
  .toggle-slider,
  .toggle-handle,
  .toggle-icons i {
    transition: none;
  }
  
  .toggle-switch:hover {
    transform: none;
  }
}
</style>