<template>
  <div class="container-fluid p-4">
    <!-- Page Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h2 mb-1 gradient-text font-secondary">3D Wealth Visualization</h1>
            <p class="text-muted mb-0">Interactive 3D visualization of your portfolio and financial data</p>
          </div>
          <div class="text-end">
            <small class="text-muted">Real-time data visualization</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Cards -->
    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <div class="card glass-card card-animated h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                <i class="fas fa-cube text-primary fa-lg"></i>
              </div>
              <div>
                <h6 class="mb-0">Portfolio Distribution</h6>
                <p class="text-muted small mb-0">Visualize asset allocation in 3D</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card glass-card card-animated h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                <i class="fas fa-chart-line text-success fa-lg"></i>
              </div>
              <div>
                <h6 class="mb-0">Performance Timeline</h6>
                <p class="text-muted small mb-0">Track performance over time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 mb-3">
        <div class="card glass-card card-animated h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                <i class="fas fa-layer-group text-info fa-lg"></i>
              </div>
              <div>
                <h6 class="mb-0">Sector Analysis</h6>
                <p class="text-muted small mb-0">Analyze sector distribution</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3D Visualization -->
    <div class="row">
      <div class="col-12">
        <div class="card glass-card card-animated">
          <div class="card-body">
            <ThreeVisualization :height="600" :auto-update="true" />
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card glass-card">
          <div class="card-body">
            <h6 class="mb-3">
              <i class="fas fa-info-circle text-primary me-2"></i>
              How to Use
            </h6>
            <div class="row">
              <div class="col-md-3">
                <div class="mb-2">
                  <i class="fas fa-mouse me-2 text-muted"></i>
                  <strong>Left Click + Drag:</strong> Rotate view
                </div>
              </div>
              <div class="col-md-3">
                <div class="mb-2">
                  <i class="fas fa-arrows-alt me-2 text-muted"></i>
                  <strong>Right Click + Drag:</strong> Pan view
                </div>
              </div>
              <div class="col-md-3">
                <div class="mb-2">
                  <i class="fas fa-search-plus me-2 text-muted"></i>
                  <strong>Scroll:</strong> Zoom in/out
                </div>
              </div>
              <div class="col-md-3">
                <div class="mb-2">
                  <i class="fas fa-hand-pointer me-2 text-muted"></i>
                  <strong>Hover:</strong> View details
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
import ThreeVisualization from '@/components/charts/ThreeVisualization.vue'
</script>