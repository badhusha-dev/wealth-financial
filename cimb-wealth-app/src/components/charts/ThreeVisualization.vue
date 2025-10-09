<template>
  <div class="three-visualization-container">
    <div class="controls-panel glass rounded p-3 mb-3">
      <div class="row g-2 align-items-center">
        <div class="col-auto">
          <label class="form-label small mb-0">View Type:</label>
        </div>
        <div class="col-auto">
          <select class="form-select form-select-sm glass" v-model="currentViewType" @change="switchVisualization">
            <option value="portfolio">Portfolio Distribution</option>
            <option value="performance">Performance Timeline</option>
            <option value="sectors">Sector Analysis</option>
          </select>
        </div>
        <div class="col-auto">
          <button class="btn btn-sm btn-glass micro-bounce" @click="resetCamera">
            <i class="fas fa-sync-alt me-1"></i>
            Reset View
          </button>
        </div>
        <div class="col-auto">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" v-model="autoRotate" id="autoRotateSwitch">
            <label class="form-check-label small" for="autoRotateSwitch">Auto Rotate</label>
          </div>
        </div>
      </div>
    </div>

    <div class="visualization-wrapper glass-card card-animated" ref="containerRef">
      <canvas ref="canvasRef" class="three-canvas"></canvas>
      
      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading visualization...</span>
        </div>
      </div>

      <!-- Info Panel -->
      <div v-if="hoveredObject" class="info-panel glass" :style="infoPanelStyle">
        <div class="info-content">
          <h6 class="mb-1">{{ hoveredObject.title }}</h6>
          <div class="small text-muted mb-2">{{ hoveredObject.category }}</div>
          <div class="fw-bold text-primary">{{ formatCurrency(hoveredObject.value) }}</div>
          <div class="small">{{ hoveredObject.percentage }}% of portfolio</div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="legend-panel glass rounded p-3 mt-3">
      <div class="row g-2">
        <div v-for="item in legendItems" :key="item.id" class="col-auto">
          <div class="legend-item d-flex align-items-center">
            <div class="legend-color me-2" :style="{ backgroundColor: item.color }"></div>
            <span class="small">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { usePortfolioStore } from '@/stores/portfolio'
import { useThemeStore } from '@/stores/theme'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  height?: number
  autoUpdate?: boolean
}>()

// Stores and composables
const portfolioStore = usePortfolioStore()
const themeStore = useThemeStore()
const { isDarkMode } = storeToRefs(themeStore)

// Template refs
const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

// State
const loading = ref(true)
const currentViewType = ref('portfolio')
const autoRotate = ref(true)
const hoveredObject = ref<any>(null)
const infoPanelPosition = ref({ x: 0, y: 0 })

// Three.js objects
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number
let meshObjects: THREE.Mesh[] = []
let interactiveMeshes: THREE.Mesh[] = []
let lastHoveredMesh: THREE.Mesh | null = null
let raycaster: THREE.Raycaster
let mouse: THREE.Vector2

// Colors - CIMB brand palette
const colors = {
  primary: '#DC143C',
  secondary: '#8B0000',
  accent: '#FF6B6B',
  success: '#28a745',
  warning: '#ffc107',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  stocks: '#DC143C',
  bonds: '#28a745',
  etfs: '#17a2b8',
  crypto: '#ffc107',
  cash: '#6c757d',
  reits: '#fd7e14'
}

// Computed
const legendItems = computed(() => {
  if (currentViewType.value === 'portfolio') {
    return [
      { id: 'stocks', label: 'Stocks', color: colors.stocks },
      { id: 'bonds', label: 'Bonds', color: colors.bonds },
      { id: 'etfs', label: 'ETFs', color: colors.etfs },
      { id: 'crypto', label: 'Crypto', color: colors.crypto },
      { id: 'cash', label: 'Cash', color: colors.cash },
      { id: 'reits', label: 'REITs', color: colors.reits }
    ]
  } else if (currentViewType.value === 'performance') {
    return [
      { id: 'gains', label: 'Gains', color: colors.success },
      { id: 'losses', label: 'Losses', color: colors.primary },
      { id: 'neutral', label: 'Neutral', color: colors.info }
    ]
  } else {
    return [
      { id: 'technology', label: 'Technology', color: colors.primary },
      { id: 'finance', label: 'Finance', color: colors.success },
      { id: 'healthcare', label: 'Healthcare', color: colors.info },
      { id: 'energy', label: 'Energy', color: colors.warning },
      { id: 'other', label: 'Other', color: colors.dark }
    ]
  }
})

const infoPanelStyle = computed(() => ({
  left: `${infoPanelPosition.value.x}px`,
  top: `${infoPanelPosition.value.y}px`
}))

// Methods
function initThreeJS() {
  if (!containerRef.value || !canvasRef.value) return

  const container = containerRef.value
  const canvas = canvasRef.value
  
  const width = container.clientWidth
  const height = props.height || 400

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(isDarkMode.value ? '#1a1d29' : '#f8f9fa')

  // Camera
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(10, 10, 10)

  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true,
    alpha: true
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = true
  controls.autoRotate = autoRotate.value
  controls.autoRotateSpeed = 1

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  // Raycaster for mouse interactions
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // Event listeners
  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('click', onMouseClick)
  window.addEventListener('resize', onWindowResize)

  // Create initial visualization
  createVisualization()
  
  // Start animation loop
  animate()
  
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

function createVisualization() {
  // Clear existing meshes
  meshObjects.forEach(mesh => {
    scene.remove(mesh)
  })
  meshObjects = []
  interactiveMeshes = []
  lastHoveredMesh = null

  if (currentViewType.value === 'portfolio') {
    createPortfolioVisualization()
  } else if (currentViewType.value === 'performance') {
    createPerformanceVisualization()
  } else {
    createSectorVisualization()
  }
}

function createPortfolioVisualization() {
  const portfolioData = [
    { name: 'Stocks', value: 450000, percentage: 45, color: colors.stocks },
    { name: 'Bonds', value: 250000, percentage: 25, color: colors.bonds },
    { name: 'ETFs', value: 150000, percentage: 15, color: colors.etfs },
    { name: 'Crypto', value: 80000, percentage: 8, color: colors.crypto },
    { name: 'Cash', value: 50000, percentage: 5, color: colors.cash },
    { name: 'REITs', value: 20000, percentage: 2, color: colors.reits }
  ]

  const radius = 5
  let angleOffset = 0

  portfolioData.forEach((item, index) => {
    // Create cylinder for each asset class
    const height = (item.percentage / 100) * 8 + 1
    const geometry = new THREE.CylinderGeometry(0.8, 0.8, height, 8)
    const material = new THREE.MeshLambertMaterial({ 
      color: new THREE.Color(item.color),
      transparent: true,
      opacity: 0.9
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    
    // Position in circle
    const angle = (index / portfolioData.length) * Math.PI * 2
    mesh.position.x = Math.cos(angle) * radius
    mesh.position.z = Math.sin(angle) * radius
    mesh.position.y = height / 2

    // Add metadata for hover
    mesh.userData = {
      title: item.name,
      category: 'Asset Class',
      value: item.value,
      percentage: item.percentage,
      originalColor: item.color
    }

    mesh.castShadow = true
    mesh.receiveShadow = true
    
    scene.add(mesh)
    meshObjects.push(mesh)
    interactiveMeshes.push(mesh)
    interactiveMeshes.push(mesh)

    // Add floating label
    const labelGeometry = new THREE.PlaneGeometry(2, 0.5)
    const labelTexture = createTextTexture(item.name)
    const labelMaterial = new THREE.MeshBasicMaterial({ 
      map: labelTexture,
      transparent: true,
      opacity: 0.8
    })
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial)
    labelMesh.position.copy(mesh.position)
    labelMesh.position.y += height/2 + 1
    labelMesh.lookAt(camera.position)
    
    scene.add(labelMesh)
    meshObjects.push(labelMesh)
  })
}

function createPerformanceVisualization() {
  const performanceData = [
    { name: 'Q1 2024', value: 95000, performance: 5.2, color: colors.success },
    { name: 'Q2 2024', value: 102000, performance: 7.4, color: colors.success },
    { name: 'Q3 2024', value: 98000, performance: -3.9, color: colors.primary },
    { name: 'Q4 2024', value: 110000, performance: 12.2, color: colors.success }
  ]

  performanceData.forEach((item, index) => {
    // Create bars representing performance
    const height = Math.abs(item.performance) * 0.5 + 0.5
    const geometry = new THREE.BoxGeometry(1.5, height, 1.5)
    const material = new THREE.MeshLambertMaterial({ 
      color: new THREE.Color(item.color),
      transparent: true,
      opacity: 0.8
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = (index - 1.5) * 3
    mesh.position.y = item.performance < 0 ? -height/2 : height/2
    
    // Add metadata
    mesh.userData = {
      title: item.name,
      category: 'Quarterly Performance',
      value: item.value,
      percentage: item.performance
    }

    mesh.castShadow = true
    mesh.receiveShadow = true
    
    scene.add(mesh)
    meshObjects.push(mesh)
    interactiveMeshes.push(mesh)
  })

  // Add ground plane
  const groundGeometry = new THREE.PlaneGeometry(15, 8)
  const groundMaterial = new THREE.MeshLambertMaterial({ 
    color: 0x808080,
    transparent: true,
    opacity: 0.3
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
  meshObjects.push(ground)
}

function createSectorVisualization() {
  const sectorData = [
    { name: 'Technology', value: 180000, percentage: 36, color: colors.primary },
    { name: 'Finance', value: 120000, percentage: 24, color: colors.success },
    { name: 'Healthcare', value: 100000, percentage: 20, color: colors.info },
    { name: 'Energy', value: 60000, percentage: 12, color: colors.warning },
    { name: 'Other', value: 40000, percentage: 8, color: colors.dark }
  ]

  // Create sphere arrangement
  const radius = 6
  sectorData.forEach((item, index) => {
    const sphereRadius = Math.sqrt(item.percentage / 100) * 1.5 + 0.3
    const geometry = new THREE.SphereGeometry(sphereRadius, 16, 12)
    const material = new THREE.MeshLambertMaterial({ 
      color: new THREE.Color(item.color),
      transparent: true,
      opacity: 0.85
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    
    // Spiral arrangement
    const angle = (index / sectorData.length) * Math.PI * 2
    const spiralRadius = radius - index * 0.5
    mesh.position.x = Math.cos(angle) * spiralRadius
    mesh.position.z = Math.sin(angle) * spiralRadius
    mesh.position.y = index * 0.5
    
    // Add metadata
    mesh.userData = {
      title: item.name,
      category: 'Sector Allocation',
      value: item.value,
      percentage: item.percentage
    }

    mesh.castShadow = true
    mesh.receiveShadow = true
    
    scene.add(mesh)
    meshObjects.push(mesh)
    interactiveMeshes.push(mesh)
  })
}

function createTextTexture(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const context = canvas.getContext('2d')!
  
  context.fillStyle = isDarkMode.value ? '#ffffff' : '#000000'
  context.font = 'bold 20px Arial'
  context.textAlign = 'center'
  context.fillText(text, 128, 40)
  
  return new THREE.CanvasTexture(canvas)
}

function onMouseMove(event: MouseEvent) {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // Update info panel position
  infoPanelPosition.value = {
    x: event.clientX - rect.left + 10,
    y: event.clientY - rect.top - 10
  }

  // Reset previous hover if exists
  if (lastHoveredMesh && lastHoveredMesh.material instanceof THREE.MeshLambertMaterial) {
    lastHoveredMesh.material.opacity = 0.9
    lastHoveredMesh.scale.setScalar(1)
  }

  // Raycast for hover effects - only against interactive meshes
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(interactiveMeshes)

  if (intersects.length > 0) {
    const object = intersects[0].object as THREE.Mesh
    if (object.userData.title) {
      hoveredObject.value = object.userData
      lastHoveredMesh = object
      
      // Highlight effect
      if (object.material instanceof THREE.MeshLambertMaterial) {
        object.material.opacity = 1
        object.scale.setScalar(1.1)
      }
    }
  } else {
    hoveredObject.value = null
    lastHoveredMesh = null
  }
}

function onMouseClick(event: MouseEvent) {
  if (hoveredObject.value) {
    // Add click interactions here
  }
}

function onWindowResize() {
  if (!containerRef.value) return

  const width = containerRef.value.clientWidth
  const height = props.height || 400

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  
  controls.update()
  
  // Animate meshes and update labels to face camera
  meshObjects.forEach((mesh, index) => {
    if (mesh.userData.title && currentViewType.value === 'portfolio') {
      mesh.rotation.y += 0.005
    }
    
    // Make labels billboard (face camera)
    if (mesh.geometry instanceof THREE.PlaneGeometry && mesh.material instanceof THREE.MeshBasicMaterial) {
      mesh.lookAt(camera.position)
    }
  })
  
  renderer.render(scene, camera)
}

function resetCamera() {
  camera.position.set(10, 10, 10)
  controls.reset()
}

function switchVisualization() {
  loading.value = true
  
  setTimeout(() => {
    createVisualization()
    resetCamera()
    loading.value = false
  }, 300)
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Watchers
watch(autoRotate, (newValue) => {
  if (controls) {
    controls.autoRotate = newValue
  }
})

watch(isDarkMode, () => {
  if (scene) {
    scene.background = new THREE.Color(isDarkMode.value ? '#1a1d29' : '#f8f9fa')
  }
})

// Lifecycle
onMounted(async () => {
  await nextTick()
  initThreeJS()
})

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousemove', onMouseMove)
    canvasRef.value.removeEventListener('click', onMouseClick)
  }
  
  window.removeEventListener('resize', onWindowResize)
  
  if (renderer) {
    renderer.dispose()
  }
})
</script>

<style scoped>
.three-visualization-container {
  position: relative;
}

.visualization-wrapper {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(220, 20, 60, 0.1);
  background: var(--bs-body-bg);
}

.three-canvas {
  display: block;
  width: 100%;
  height: auto;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.info-panel {
  position: absolute;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 20;
  pointer-events: none;
  max-width: 200px;
  backdrop-filter: blur(10px);
}

.info-content h6 {
  color: var(--bs-primary);
  font-weight: 600;
}

.legend-panel {
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 8px;
  padding: 12px;
}

.legend-item {
  font-size: 0.875rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.controls-panel {
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 8px;
  padding: 12px;
}

[data-bs-theme="dark"] .loading-overlay {
  background: rgba(26, 29, 41, 0.9);
}

[data-bs-theme="dark"] .info-panel {
  background: rgba(26, 29, 41, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-bs-theme="dark"] .legend-color {
  border-color: rgba(255, 255, 255, 0.2);
}
</style>