<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const photos = useStorage('my-photos', [])
</script>

<template>
    <div class="grid grid-cols-4 gap-4 p-4">
        <div v-for="(photo, index) in photos" :key="index">
            <img class="col-span-1" :src="photo" alt="Frieren" />
        </div>
    </div>
</template>
