import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import usersData from '@/data/users.json'

interface User {
  id: string
  username: string
  passwordHash: string
  role: 'customer' | 'advisor' | 'admin'
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  accountNumber?: string
  employeeId?: string
  profilePicture: string
  preferences: {
    theme: string
    currency: string
    language: string
    notifications?: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
  createdAt: string
  lastLogin: string
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const loginError = ref('')

  const userRole = computed(() => currentUser.value?.role || null)
  const isCustomer = computed(() => userRole.value === 'customer')
  const isAdvisor = computed(() => userRole.value === 'advisor')
  const isAdmin = computed(() => userRole.value === 'admin')
  const fullName = computed(() => 
    currentUser.value ? `${currentUser.value.firstName} ${currentUser.value.lastName}` : ''
  )

  // Mock authentication - in production, this would call a real API
  async function login(username: string, password: string): Promise<boolean> {
    try {
      loginError.value = ''
      
      // Remove logout popstate listener if it exists
      cleanupLogout()
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Find user by username
      const user = usersData.find(u => u.username === username)
      
      if (!user) {
        loginError.value = 'Invalid username or password'
        return false
      }
      
      // Mock password verification (in production, use bcrypt.compare)
      const mockPasswordCheck = (password: string, role: string) => {
        const validPasswords: Record<string, string> = {
          'customer': 'password123',
          'advisor': 'advisor2024', 
          'admin': 'adminSecure2024'
        }
        return validPasswords[role] === password
      }
      
      if (!mockPasswordCheck(password, user.role)) {
        loginError.value = 'Invalid username or password'
        return false
      }
      
      currentUser.value = user as User
      isAuthenticated.value = true
      
      // Update last login time
      currentUser.value.lastLogin = new Date().toISOString()
      
      // Save to localStorage for persistence (exclude sensitive data)
      const userForStorage = {
        id: currentUser.value.id,
        username: currentUser.value.username,
        role: currentUser.value.role,
        firstName: currentUser.value.firstName,
        lastName: currentUser.value.lastName,
        email: currentUser.value.email,
        profilePicture: currentUser.value.profilePicture,
        preferences: currentUser.value.preferences,
        lastLogin: currentUser.value.lastLogin
      }
      localStorage.setItem('authToken', 'mock-jwt-token-' + user.id)
      localStorage.setItem('currentUser', JSON.stringify(userForStorage))
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      loginError.value = 'An error occurred during login'
      return false
    }
  }

  async function logout() {
    currentUser.value = null
    isAuthenticated.value = false
    loginError.value = ''
    
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
    localStorage.clear()
    
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '/login')
      window.addEventListener('popstate', preventBack)
    }
    
    return Promise.resolve()
  }
  
  function preventBack() {
    window.history.pushState(null, '', '/login')
  }
  
  function cleanupLogout() {
    window.removeEventListener('popstate', preventBack)
  }

  function initializeAuth() {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('currentUser')
    
    if (token && userData) {
      try {
        currentUser.value = JSON.parse(userData)
        isAuthenticated.value = true
        // Remove any lingering logout listeners
        cleanupLogout()
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        logout()
      }
    }
  }

  function updateUserPreferences(preferences: Partial<User['preferences']>) {
    if (currentUser.value) {
      currentUser.value.preferences = { ...currentUser.value.preferences, ...preferences }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    }
  }

  return {
    currentUser,
    isAuthenticated,
    loginError,
    userRole,
    isCustomer,
    isAdvisor,
    isAdmin,
    fullName,
    login,
    logout,
    cleanupLogout,
    initializeAuth,
    updateUserPreferences
  }
})