<template>
  <div class="dashboard-layout">
    <AppSidebar />
    <div 
      class="main-content" 
      :class="{ 'sidebar-collapsed': themeStore.sidebarCollapsed }"
    >
      <AppNavbar />
      <main class="p-4">
        <router-view v-slot="{ Component, route }">
          <transition
            name="page"
            mode="out-in"
            enter-active-class="page-enter-active"
            leave-active-class="page-leave-active"
            enter-from-class="page-enter-from"
            leave-to-class="page-leave-to"
          >
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
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

/* Page Transitions */
:deep(.page-enter-active) {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

:deep(.page-leave-active) {
  transition: all 0.3s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

:deep(.page-enter-from) {
  opacity: 0;
  transform: translateX(20px) scale(0.98);
}

:deep(.page-leave-to) {
  opacity: 0;
  transform: translateX(-20px) scale(1.02);
}
</style>