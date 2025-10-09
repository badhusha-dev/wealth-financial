<template>
  <div class="login-container">
    <div class="container-fluid vh-100 p-0">
      <div class="row g-0 h-100">
        <!-- Left Side - Branding -->
        <div class="col-lg-6 d-none d-lg-flex branding-section">
          <div class="d-flex flex-column justify-content-center align-items-center w-100 p-5">
            <img src="/favicon.ico" alt="CIMB" width="120" height="120" class="mb-4">
            <h1 class="display-4 fw-bold text-white mb-3">CIMB Wealth</h1>
            <p class="lead text-white-50 text-center mb-4">
              Your comprehensive financial management portal
            </p>
            <div class="features-list text-white-50">
              <div class="feature-item mb-3">
                <i class="fas fa-chart-line me-3"></i>
                <span>Real-time portfolio tracking</span>
              </div>
              <div class="feature-item mb-3">
                <i class="fas fa-shield-alt me-3"></i>
                <span>Secure wealth management</span>
              </div>
              <div class="feature-item mb-3">
                <i class="fas fa-chart-pie me-3"></i>
                <span>Advanced analytics & reporting</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-mobile-alt me-3"></i>
                <span>Access anywhere, anytime</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="col-lg-6 d-flex align-items-center justify-content-center">
          <div class="login-form-container w-100 px-4 px-lg-5 py-5">
            <div class="login-form-wrapper" style="max-width: 500px; margin: 0 auto;">
              <!-- Mobile Branding (shown only on small screens) -->
              <div class="text-center mb-4 d-lg-none">
                <img src="/favicon.ico" alt="CIMB" width="80" height="80" class="mb-3">
                <h2 class="text-primary fw-bold">CIMB Wealth</h2>
                <p class="text-muted">Financial Management Portal</p>
              </div>

              <!-- Desktop Header -->
              <div class="mb-4 d-none d-lg-block">
                <h2 class="fw-bold mb-2">Welcome Back</h2>
                <p class="text-muted">Sign in to access your financial dashboard</p>
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
              <div class="border-top pt-4 mt-4">
                <p class="text-center text-muted small mb-3">Quick Access Demo Accounts</p>
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
  background-color: var(--bs-body-bg);
  min-height: 100vh;
}

/* Branding Section */
.branding-section {
  background: linear-gradient(135deg, var(--cimb-red) 0%, var(--cimb-red-dark) 100%);
  position: relative;
  overflow: hidden;
}

.branding-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.6;
}

.features-list {
  position: relative;
  z-index: 1;
}

.feature-item {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
}

.feature-item i {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Login Form Section */
.login-form-container {
  background-color: var(--bs-body-bg);
}

[data-theme="dark"] .login-form-container {
  background-color: var(--bs-body-bg);
}

.btn-primary {
  background: linear-gradient(135deg, var(--cimb-red) 0%, var(--cimb-red-dark) 100%);
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem;
  font-weight: 500;
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--cimb-red-dark) 0%, var(--cimb-red) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(220, 20, 60, 0.3);
}

.form-control {
  border-radius: 0.75rem;
  border: 2px solid var(--bs-border-color);
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
}

.form-control:focus {
  border-color: var(--cimb-red);
  box-shadow: 0 0 0 0.25rem rgba(220, 20, 60, 0.15);
}

.form-control-lg {
  padding: 0.875rem 1.25rem;
  font-size: 1.05rem;
}

.btn-outline-primary,
.btn-outline-secondary,
.btn-outline-dark {
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  border-width: 2px;
}

.btn-outline-primary:hover,
.btn-outline-secondary:hover,
.btn-outline-dark:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive adjustments */
@media (max-width: 991.98px) {
  .login-form-wrapper {
    max-width: 450px !important;
  }
}

@media (max-width: 767.98px) {
  .login-form-container {
    padding: 2rem 1.5rem !important;
  }
  
  .login-form-wrapper {
    max-width: 100% !important;
  }
}

/* Animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form-wrapper {
  animation: fadeInUp 0.6s ease-out;
}
</style>