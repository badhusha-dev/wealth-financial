import { useAuthStore } from '@/stores/auth'

export function requireAuth(to: any, from: any, next: any) {
  const authStore = useAuthStore()
  
  // Initialize auth from localStorage before checking
  authStore.initializeAuth()
  
  if (!authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next('/login')
  } else {
    next()
  }
}

export function requireRole(allowedRoles: string[]) {
  return function(to: any, from: any, next: any) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    if (!authStore.currentUser || !allowedRoles.includes(authStore.currentUser.role)) {
      // Redirect to dashboard if user doesn't have required role
      next('/')
      return
    }
    
    next()
  }
}

export function redirectIfAuthenticated(to: any, from: any, next: any) {
  const authStore = useAuthStore()
  
  // Initialize auth from localStorage before checking
  authStore.initializeAuth()
  
  if (authStore.isAuthenticated) {
    // Redirect to dashboard if already authenticated
    next('/')
  } else {
    next()
  }
}