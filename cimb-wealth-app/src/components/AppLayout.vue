<template>
  <div class="dashboard-layout">
    <AppSidebar />
    <div 
      class="main-content" 
      :class="{ 'sidebar-collapsed': themeStore.sidebarCollapsed }"
    >
      <AppNavbar />
      <main class="p-4">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import AppSidebar from './AppSidebar.vue'
import AppNavbar from './AppNavbar.vue'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initializeTheme()
})
</script>

<style scoped>
.main-content {
  background-color: var(--bs-body-bg);
  min-height: 100vh;
}
</style>