import './assets/main.css'

import { createApp } from 'vue'
import App from '@/App.vue' // Alterado para o layout principal
import router from '@/router/index.js'

const app = createApp(App)
app.use(router)
app.mount('#app')
