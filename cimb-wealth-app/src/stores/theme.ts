import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDarkMode = ref(false)
  const sidebarCollapsed = ref(false)
  const mobileMenuOpen = ref(false)

  const currentTheme = computed(() => isDarkMode.value ? 'dark' : 'light')

  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    updateThemeClass()
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
  }

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  function setTheme(theme: 'light' | 'dark') {
    isDarkMode.value = theme === 'dark'
    localStorage.setItem('theme', theme)
    updateThemeClass()
  }

  function updateThemeClass() {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
    }
  }

  function initializeTheme() {
    const savedTheme = localStorage.getItem('theme')
    const savedSidebarState = localStorage.getItem('sidebarCollapsed')
    
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
    } else {
      // Check system preference
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    if (savedSidebarState) {
      sidebarCollapsed.value = savedSidebarState === 'true'
    }
    
    updateThemeClass()
  }

  return {
    isDarkMode,
    sidebarCollapsed,
    mobileMenuOpen,
    currentTheme,
    toggleTheme,
    toggleSidebar,
    toggleMobileMenu,
    setTheme,
    initializeTheme
  }
})