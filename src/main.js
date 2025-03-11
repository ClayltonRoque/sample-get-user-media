import './assets/main.css'

import { createApp } from 'vue'
import Index from '@/pages/index.vue'
import router from '@/router/index.ts'

const app = createApp(Index)
app.use(router)
app.mount('#app')
