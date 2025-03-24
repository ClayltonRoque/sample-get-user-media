import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

console.log(process.env.DEPLOY_TARGET)
// https://vite.dev/config/
export default defineConfig({
    base:
        process.env.NODE_ENV === 'production' &&
        process.env.DEPLOY_TARGET === 'github'
            ? '/sample-get-user-media'
            : '/',
    plugins: [vue(), vueDevTools(), tailwindcss()],
    build: {
        outDir: process.env.DEPLOY_TARGET === 'github' ? 'docs' : 'dist',
        assetsDir: 'assets',
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
})
