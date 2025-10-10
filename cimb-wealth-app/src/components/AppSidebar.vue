<template>
  <div :class="['sidebar', { 'sidebar-collapsed': themeStore.sidebarCollapsed, 'mobile-open': themeStore.mobileMenuOpen }]">
    <div class="sidebar-header p-3 border-bottom">
      <div class="d-flex align-items-center">
        <img v-if="!themeStore.sidebarCollapsed" src="/favicon.ico" alt="CIMB" class="me-2" width="32" height="32">
        <div v-if="!themeStore.sidebarCollapsed" class="fw-bold sidebar-brand">CIMB Wealth</div>
        <img v-else src="/favicon.ico" alt="CIMB" width="32" height="32">
      </div>
    </div>
    
    <nav class="flex-fill sidebar-nav p-3">
      <ul class="nav flex-column">
        <li class="nav-item" v-for="item in navigationItems" :key="item.name">
          <router-link 
            :to="item.path" 
            class="nav-link"
            :class="{ active: isActiveRoute(item.path) }"
            @click="themeStore.mobileMenuOpen && themeStore.toggleMobileMenu()"
          >
            <i :class="item.icon" class="sidebar-icon"></i>
            <span v-if="!themeStore.sidebarCollapsed" class="nav-label">{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <div class="sidebar-footer p-3 border-top">
      <div v-if="!themeStore.sidebarCollapsed" class="small text-muted">
        <i class="fas fa-shield-alt me-2"></i>Secure Banking
      </div>
      <div v-else class="text-center">
        <i class="fas fa-shield-alt text-muted"></i>
      </div>
    </div>
  </div>
  
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
  { name: 'Dashboard', path: '/', icon: 'fas fa-th-large' },
  { name: 'Portfolio', path: '/portfolio', icon: 'fas fa-briefcase' },
  { name: 'Unit Trusts', path: '/unit-trusts', icon: 'fas fa-layer-group' },
  { name: 'Bond Market', path: '/bonds/market', icon: 'fas fa-landmark' },
  { name: 'My Bonds', path: '/bonds/my-bonds', icon: 'fas fa-wallet' },
  { name: 'Bond Analytics', path: '/bonds/analytics', icon: 'fas fa-chart-line' },
  { name: 'Bond Reports', path: '/bonds/reports', icon: 'fas fa-file-contract' },
  { name: 'Transactions', path: '/transactions', icon: 'fas fa-exchange-alt' },
  { name: 'Goals', path: '/goals', icon: 'fas fa-bullseye' },
  { name: 'Reports', path: '/reports', icon: 'fas fa-chart-bar' },
  { name: '3D Visualization', path: '/3d-viz', icon: 'fas fa-cube' }
]

function isActiveRoute(path: string) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.sidebar {
  background: var(--bs-body-bg);
  border-right: 1px solid var(--bs-border-color);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-header {
  min-height: 64px;
  display: flex;
  align-items: center;
}

.sidebar-brand {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.sidebar-nav {
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--bs-border-color);
  border-radius: 3px;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-link:hover {
  background: var(--bs-secondary-bg);
  color: var(--cimb-red);
  transform: translateX(4px);
}

.nav-link.active {
  background: var(--cimb-red-bright);
  color: #ffffff;
  font-weight: 600;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 70%;
  background: #ffffff;
  border-radius: 0 4px 4px 0;
}

.sidebar-icon {
  min-width: 1.5rem;
  margin-right: 0.75rem;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.nav-link:hover .sidebar-icon {
  transform: scale(1.1);
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-collapsed .nav-link {
  justify-content: center;
  padding: 0.75rem 0.5rem;
}

.sidebar-collapsed .sidebar-icon {
  margin-right: 0;
  font-size: 1.25rem;
}

.sidebar-collapsed .nav-link.active::before {
  display: none;
}

.sidebar-footer {
  margin-top: auto;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-overlay.show {
  display: block;
  opacity: 1;
}

@media (max-width: 991.98px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    height: 100vh;
    width: 280px;
    z-index: 1000;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar.mobile-open {
    left: 0;
  }
  
  .nav-link:hover {
    transform: translateX(0);
  }
}

[data-theme="dark"] .sidebar {
  background: var(--bs-dark);
}

[data-theme="dark"] .nav-link:hover {
  background: rgba(220, 20, 60, 0.15);
}

[data-theme="dark"] .sidebar-overlay {
  background: rgba(0, 0, 0, 0.7);
}
</style>
