<script setup lang="ts">
import { shallowRef } from 'vue'

import Camera from '@/components/Camera.vue'
import VideoPreview from '@/components/VideoPreview.vue'

const videoPreview = shallowRef<HTMLVideoElement | null>(null)
</script>

<template>
    <div class="container mx-auto max-w-7xl">
        <Camera
            @ready="(video) => (videoPreview = video)"
            class="absolute w-0 h-0 top-0 left-0 opacity-0 pointer-events-none"
        />
        <div class="flex gap-8 items-center justify-center h-screen w-full">
            <Suspense>
                <VideoPreview v-if="videoPreview" :video="videoPreview" />
            </Suspense>
        </div>
    </div>
</template>
