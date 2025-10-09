<template>
  <div :class="['sidebar', { 'sidebar-collapsed': themeStore.sidebarCollapsed, 'mobile-open': themeStore.mobileMenuOpen }]">
    <div class="p-3 border-bottom">
      <div class="d-flex align-items-center">
        <img v-if="!themeStore.sidebarCollapsed" src="/favicon.ico" alt="CIMB" class="me-2" width="32" height="32">
        <div v-if="!themeStore.sidebarCollapsed" class="fw-bold text-primary">CIMB Wealth</div>
      </div>
    </div>
    
    <nav class="flex-fill p-3">
      <ul class="nav flex-column">
        <li class="nav-item" v-for="item in navigationItems" :key="item.name">
          <router-link 
            :to="item.path" 
            class="nav-link"
            :class="{ active: $route.path === item.path }"
          >
            <i :class="item.icon" class="me-2"></i>
            <span v-if="!themeStore.sidebarCollapsed">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
  
  <!-- Mobile Overlay -->
  <div 
    class="sidebar-overlay" 
    :class="{ show: themeStore.mobileMenuOpen }"
    @click="themeStore.toggleMobileMenu"
  ></div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { useRoute } from 'vue-router'

const themeStore = useThemeStore()
const route = useRoute()

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: 'fas fa-chart-line' },
  { name: 'Portfolio', path: '/portfolio', icon: 'fas fa-briefcase' },
  { name: 'Unit Trusts', path: '/unit-trusts', icon: 'fas fa-chart-pie' },
  { name: 'Transactions', path: '/transactions', icon: 'fas fa-exchange-alt' },
  { name: 'Goals', path: '/goals', icon: 'fas fa-target' },
  { name: 'Reports', path: '/reports', icon: 'fas fa-file-alt' },
  { name: '3D Visualization', path: '/3d-viz', icon: 'fas fa-cube' }
]
</script>

<style scoped>
.nav-link {
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-link:hover {
  text-decoration: none;
}

.sidebar-collapsed .nav-link {
  text-align: center;
  padding: 0.75rem 0.5rem;
}
</style>