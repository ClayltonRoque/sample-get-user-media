import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/pages/index.vue'
import About from '@/pages/about.vue'

const routes = [
    { path: '/', component: Index },
    { path: '/about', component: About },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
