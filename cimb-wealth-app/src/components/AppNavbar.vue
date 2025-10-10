<template>
  <nav class="navbar navbar-expand-lg sticky-top">
    <div class="container-fluid">
      <button 
        class="btn d-lg-none me-2" 
        @click="themeStore.toggleMobileMenu"
        aria-label="Toggle menu"
      >
        <i class="fas fa-bars"></i>
      </button>
      
      <button 
        class="btn d-none d-lg-block me-3" 
        @click="themeStore.toggleSidebar"
        aria-label="Toggle sidebar"
      >
        <i class="fas fa-bars"></i>
      </button>
      
      <div class="navbar-brand mb-0 h1">{{ pageTitle }}</div>
      
      <div class="ms-auto d-flex align-items-center">
        <div class="me-3 d-none d-md-block">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control form-control-sm" 
              placeholder="Search..." 
              style="width: 200px;"
            >
            <button class="btn btn-outline-secondary btn-sm" type="button">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>
        
        <button class="btn position-relative me-2" aria-label="Notifications">
          <i class="fas fa-bell"></i>
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            3
          </span>
        </button>
        
        <button 
          class="theme-toggle me-3" 
          @click="themeStore.toggleTheme"
          :aria-label="themeStore.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <i :class="themeStore.isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </button>
        
        <BDropdown 
          variant="outline-secondary"
          toggle-class="d-flex align-items-center"
          menu-class="dropdown-menu-end"
          no-caret
          right
        >
          <template #button-content>
            <img 
              :src="authStore.currentUser?.profilePicture || '/favicon.ico'" 
              alt="User" 
              class="rounded-circle me-2" 
              width="32" 
              height="32"
            >
            <span class="d-none d-sm-inline">{{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}</span>
            <i class="fas fa-chevron-down ms-2"></i>
          </template>
          
          <BDropdownItem @click="goToProfile">
            <i class="fas fa-user me-2"></i>View Profile
          </BDropdownItem>
          <BDropdownItem @click="goToSettings">
            <i class="fas fa-cog me-2"></i>Settings
          </BDropdownItem>
          <BDropdownDivider />
          <BDropdownItem @click="handleLogout" variant="danger">
            <i class="fas fa-sign-out-alt me-2"></i>Logout
          </BDropdownItem>
        </BDropdown>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { BDropdown, BDropdownItem, BDropdownDivider } from 'bootstrap-vue-next'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  const routeTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/portfolio': 'Portfolio',
    '/unit-trusts': 'Unit Trusts',
    '/bonds/market': 'Bond Market',
    '/bonds/my-bonds': 'My Bonds',
    '/bonds/analytics': 'Bond Analytics',
    '/bonds/reports': 'Bond Reports',
    '/transactions': 'Transactions', 
    '/goals': 'Financial Goals',
    '/reports': 'Reports',
    '/3d-viz': '3D Wealth Visualization'
  }
  return routeTitles[route.path] || 'CIMB Wealth'
})

function goToProfile() {
  router.push('/profile')
}

function goToSettings() {
  router.push('/settings')
}

async function handleLogout() {
  await authStore.logout()
  router.replace('/login')
}
</script>

<style scoped>
.navbar {
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--bs-border-color);
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--text-primary);
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0.375rem;
}

.theme-toggle:hover {
  background: var(--bs-secondary-bg);
  transform: scale(1.1);
}

.btn:focus,
.theme-toggle:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(220, 20, 60, 0.25);
}

:deep(.dropdown-toggle) {
  transition: all 0.2s ease;
}

:deep(.dropdown-toggle:hover) {
  background: var(--bs-secondary-bg);
  border-color: var(--cimb-red);
}

:deep(.dropdown-menu) {
  margin-top: 0.5rem;
  border: 1px solid var(--bs-border-color);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

:deep(.dropdown-item) {
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

:deep(.dropdown-item:hover) {
  background: var(--bs-secondary-bg);
}

:deep(.dropdown-item.text-danger) {
  color: var(--cimb-red) !important;
}

:deep(.dropdown-item.text-danger:hover) {
  background: rgba(220, 20, 60, 0.1);
}
</style>
