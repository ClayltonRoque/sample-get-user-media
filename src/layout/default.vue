<template>
    <div>
        <nav class="flex gap-8 justify-center p-4 bg-slate-500">
            <router-link to="/">Home</router-link>
            <router-link to="/listPhotos">Listar suas fotos</router-link>
        </nav>
        <router-view />
    </div>
</template>
