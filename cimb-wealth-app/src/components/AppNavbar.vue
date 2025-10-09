<template>
  <nav class="navbar navbar-expand-lg sticky-top">
    <div class="container-fluid">
      <!-- Mobile Menu Toggle -->
      <button 
        class="btn d-lg-none me-2" 
        @click="themeStore.toggleMobileMenu"
        aria-label="Toggle menu"
      >
        <i class="fas fa-bars"></i>
      </button>
      
      <!-- Sidebar Toggle -->
      <button 
        class="btn d-none d-lg-block me-3" 
        @click="themeStore.toggleSidebar"
        aria-label="Toggle sidebar"
      >
        <i class="fas fa-bars"></i>
      </button>
      
      <!-- Page Title -->
      <div class="navbar-brand mb-0 h1">{{ pageTitle }}</div>
      
      <div class="ms-auto d-flex align-items-center">
        <!-- Search -->
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
        
        <!-- Notifications -->
        <button class="btn position-relative me-2" aria-label="Notifications">
          <i class="fas fa-bell"></i>
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            3
          </span>
        </button>
        
        <!-- Theme Toggle -->
        <button 
          class="theme-toggle me-3" 
          @click="themeStore.toggleTheme"
          :aria-label="themeStore.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <i :class="themeStore.isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </button>
        
        <!-- User Menu -->
        <div class="dropdown">
          <button 
            class="btn btn-outline-secondary dropdown-toggle d-flex align-items-center" 
            type="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            <img 
              src="/favicon.ico" 
              alt="User" 
              class="rounded-circle me-2" 
              width="24" 
              height="24"
            >
            <span class="d-none d-sm-inline">{{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Profile</a></li>
            <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Settings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" @click.prevent="handleLogout"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  const routeTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/portfolio': 'Portfolio',
    '/transactions': 'Transactions', 
    '/goals': 'Financial Goals',
    '/reports': 'Reports',
    '/3d-viz': '3D Wealth Visualization'
  }
  return routeTitles[route.path] || 'CIMB Wealth'
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>