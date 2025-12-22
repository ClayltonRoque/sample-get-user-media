import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/pages/index.vue'
import listPhotos from '@/pages/listPhotos.vue'
import baseLayout from '@/layout/default.vue'

const routes = [
    {
        path: '/',
        component: baseLayout,
        children: [
            {
                path: '',
                component: Index,
            },
            {
                path: 'faceCheck',
                component: () => import('@/pages/faceCheck.vue'),
            },
            {
                path: 'listPhotos',
                component: listPhotos,
            },
        ],
    },
    {},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
