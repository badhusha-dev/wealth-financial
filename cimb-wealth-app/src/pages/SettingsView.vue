<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <h2 class="mb-4">Settings</h2>
        
        <div class="row g-4">
          <div class="col-lg-8">
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">Preferences</h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Theme</label>
                    <select class="form-select" v-model="preferences.theme">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Currency</label>
                    <select class="form-select" v-model="preferences.currency">
                      <option value="MYR">Malaysian Ringgit (MYR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Language</label>
                    <select class="form-select" v-model="preferences.language">
                      <option value="en">English</option>
                      <option value="ms">Bahasa Malaysia</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">Notifications</h5>
              </div>
              <div class="card-body">
                <div class="form-check form-switch mb-3">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="emailNotif"
                    v-model="notifications.email"
                  >
                  <label class="form-check-label" for="emailNotif">
                    <strong>Email Notifications</strong>
                    <small class="d-block text-muted">Receive transaction alerts and updates via email</small>
                  </label>
                </div>
                <div class="form-check form-switch mb-3">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="smsNotif"
                    v-model="notifications.sms"
                  >
                  <label class="form-check-label" for="smsNotif">
                    <strong>SMS Notifications</strong>
                    <small class="d-block text-muted">Receive important alerts via SMS</small>
                  </label>
                </div>
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="pushNotif"
                    v-model="notifications.push"
                  >
                  <label class="form-check-label" for="pushNotif">
                    <strong>Push Notifications</strong>
                    <small class="d-block text-muted">Receive push notifications in the app</small>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Security</h5>
              </div>
              <div class="card-body">
                <button class="btn btn-outline-primary mb-3">
                  <i class="fas fa-key me-2"></i>Change Password
                </button>
                <br>
                <button class="btn btn-outline-primary">
                  <i class="fas fa-shield-alt me-2"></i>Two-Factor Authentication
                </button>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4">
            <div class="card">
              <div class="card-header bg-danger text-white">
                <h5 class="mb-0">Danger Zone</h5>
              </div>
              <div class="card-body">
                <p class="text-muted">Once you delete your account, there is no going back. Please be certain.</p>
                <button class="btn btn-danger w-100">
                  <i class="fas fa-trash me-2"></i>Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <button class="btn btn-primary" @click="saveSettings">
            <i class="fas fa-save me-2"></i>Save Changes
          </button>
          <button class="btn btn-outline-secondary ms-2" @click="resetSettings">
            <i class="fas fa-undo me-2"></i>Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const preferences = ref({
  theme: authStore.currentUser?.preferences.theme || 'light',
  currency: authStore.currentUser?.preferences.currency || 'MYR',
  language: authStore.currentUser?.preferences.language || 'en'
})

const notifications = ref({
  email: authStore.currentUser?.preferences.notifications?.email || true,
  sms: authStore.currentUser?.preferences.notifications?.sms || false,
  push: authStore.currentUser?.preferences.notifications?.push || true
})

function saveSettings() {
  authStore.updateUserPreferences({
    ...preferences.value,
    notifications: notifications.value
  })
  alert('Settings saved successfully!')
}

function resetSettings() {
  preferences.value = {
    theme: authStore.currentUser?.preferences.theme || 'light',
    currency: authStore.currentUser?.preferences.currency || 'MYR',
    language: authStore.currentUser?.preferences.language || 'en'
  }
  notifications.value = {
    email: authStore.currentUser?.preferences.notifications?.email || true,
    sms: authStore.currentUser?.preferences.notifications?.sms || false,
    push: authStore.currentUser?.preferences.notifications?.push || true
  }
}
</script>
