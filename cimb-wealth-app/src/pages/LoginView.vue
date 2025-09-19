<template>
  <div class="login-container">
    <div class="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div class="row w-100">
        <div class="col-12 col-md-8 col-lg-6 col-xl-4 mx-auto">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <!-- CIMB Branding -->
              <div class="text-center mb-4">
                <img src="/favicon.ico" alt="CIMB" width="64" height="64" class="mb-3">
                <h2 class="text-primary fw-bold">CIMB Wealth</h2>
                <p class="text-muted">Financial Management Portal</p>
              </div>

              <!-- Login Form -->
              <form @submit.prevent="handleLogin">
                <div class="mb-4">
                  <label for="username" class="form-label fw-medium">Username</label>
                  <input
                    type="text"
                    class="form-control form-control-lg"
                    id="username"
                    v-model="loginForm.username"
                    :class="{ 'is-invalid': authStore.loginError }"
                    placeholder="Enter your username"
                    required
                    :disabled="loading"
                  >
                </div>

                <div class="mb-4">
                  <label for="password" class="form-label fw-medium">Password</label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control form-control-lg"
                      id="password"
                      v-model="loginForm.password"
                      :class="{ 'is-invalid': authStore.loginError }"
                      placeholder="Enter your password"
                      required
                      :disabled="loading"
                    >
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showPassword = !showPassword"
                      :disabled="loading"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <!-- Error Message -->
                <div v-if="authStore.loginError" class="alert alert-danger d-flex align-items-center mb-4">
                  <i class="fas fa-exclamation-circle me-2"></i>
                  {{ authStore.loginError }}
                </div>

                <!-- Login Button -->
                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100 mb-4"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ loading ? 'Signing In...' : 'Sign In' }}
                </button>
              </form>

              <!-- Demo User Options -->
              <div class="border-top pt-4">
                <p class="text-center text-muted small mb-3">Demo User Accounts</p>
                <div class="row g-2">
                  <div class="col-12">
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-between"
                      @click="selectDemoUser('customer')"
                      :disabled="loading"
                    >
                      <div class="d-flex align-items-center">
                        <i class="fas fa-user me-2"></i>
                        <div class="text-start">
                          <div class="fw-medium">Customer</div>
                          <small class="text-muted">john.doe</small>
                        </div>
                      </div>
                      <small class="text-success">password123</small>
                    </button>
                  </div>
                  <div class="col-12">
                    <button
                      type="button"
                      class="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-between"
                      @click="selectDemoUser('advisor')"
                      :disabled="loading"
                    >
                      <div class="d-flex align-items-center">
                        <i class="fas fa-user-tie me-2"></i>
                        <div class="text-start">
                          <div class="fw-medium">Advisor</div>
                          <small class="text-muted">sarah.lim</small>
                        </div>
                      </div>
                      <small class="text-success">advisor2024</small>
                    </button>
                  </div>
                  <div class="col-12">
                    <button
                      type="button"
                      class="btn btn-outline-dark btn-sm w-100 d-flex align-items-center justify-content-between"
                      @click="selectDemoUser('admin')"
                      :disabled="loading"
                    >
                      <div class="d-flex align-items-center">
                        <i class="fas fa-user-shield me-2"></i>
                        <div class="text-start">
                          <div class="fw-medium">Administrator</div>
                          <small class="text-muted">admin.tan</small>
                        </div>
                      </div>
                      <small class="text-success">adminSecure2024</small>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="text-center mt-4 pt-4 border-top">
                <small class="text-muted">
                  &copy; 2024 CIMB Wealth Management. All rights reserved.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginForm = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)
const loading = ref(false)

const demoUsers = {
  customer: { username: 'john.doe', password: 'password123' },
  advisor: { username: 'sarah.lim', password: 'advisor2024' },
  admin: { username: 'admin.tan', password: 'adminSecure2024' }
}

async function handleLogin() {
  if (!loginForm.value.username || !loginForm.value.password) return

  try {
    loading.value = true
    const success = await authStore.login(loginForm.value.username, loginForm.value.password)
    
    if (success) {
      // Redirect to dashboard after successful login
      await router.push('/')
    }
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}

function selectDemoUser(userType: 'customer' | 'advisor' | 'admin') {
  const user = demoUsers[userType]
  loginForm.value.username = user.username
  loginForm.value.password = user.password
  
  // Clear any previous errors
  authStore.loginError = ''
}

onMounted(() => {
  // Clear any previous login errors
  authStore.loginError = ''
})
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
}

[data-theme="dark"] .login-container {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.card {
  backdrop-filter: blur(10px);
  border-radius: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--cimb-red) 0%, var(--cimb-red-dark) 100%);
  border: none;
  border-radius: 0.75rem;
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--cimb-red-dark) 0%, var(--cimb-red) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 20, 60, 0.3);
}

.form-control {
  border-radius: 0.75rem;
  border: 2px solid var(--bs-border-color);
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--cimb-red);
  box-shadow: 0 0 0 0.2rem rgba(220, 20, 60, 0.1);
}

.demo-user-btn {
  transition: all 0.2s ease;
}

.demo-user-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>