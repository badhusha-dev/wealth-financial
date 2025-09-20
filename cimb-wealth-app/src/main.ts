import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createBootstrap } from 'bootstrap-vue-next'

import App from './App.vue'
import router from './router'

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

// Font Awesome CSS
import '@fortawesome/fontawesome-free/css/all.css'

// Custom CSS
import './assets/main.css'
import './assets/theme.css'
import './assets/theme-enhanced.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createBootstrap())

app.mount('#app')
