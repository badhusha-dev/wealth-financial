<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <h2 class="mb-4">My Profile</h2>
        
        <div class="row g-4">
          <div class="col-lg-4">
            <div class="card">
              <div class="card-body text-center">
                <img 
                  :src="authStore.currentUser?.profilePicture || '/favicon.ico'" 
                  alt="Profile" 
                  class="rounded-circle mb-3"
                  width="120"
                  height="120"
                >
                <h4>{{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}</h4>
                <p class="text-muted">{{ authStore.currentUser?.role?.toUpperCase() }}</p>
                <p class="text-muted mb-0">
                  <i class="fas fa-envelope me-2"></i>{{ authStore.currentUser?.email }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Personal Information</h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">First Name</label>
                    <p>{{ authStore.currentUser?.firstName }}</p>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Last Name</label>
                    <p>{{ authStore.currentUser?.lastName }}</p>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Email</label>
                    <p>{{ authStore.currentUser?.email }}</p>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Phone</label>
                    <p>{{ authStore.currentUser?.phone }}</p>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Date of Birth</label>
                    <p>{{ formatDate(authStore.currentUser?.dateOfBirth) }}</p>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Account Number</label>
                    <p>{{ authStore.currentUser?.accountNumber || 'N/A' }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card mt-4">
              <div class="card-header">
                <h5 class="mb-0">Account Details</h5>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Username</label>
                    <p>{{ authStore.currentUser?.username }}</p>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Last Login</label>
                    <p>{{ formatDate(authStore.currentUser?.lastLogin) }}</p>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">Account Created</label>
                    <p>{{ formatDate(authStore.currentUser?.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { format } from 'date-fns'

const authStore = useAuthStore()

function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A'
  try {
    return format(new Date(dateString), 'MMM dd, yyyy')
  } catch {
    return dateString
  }
}
</script>
