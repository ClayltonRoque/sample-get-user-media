<script setup lang="ts">
import { useTemplateRef, watchEffect, onMounted } from 'vue'
import { useUserMedia } from '@vueuse/core'

const emit = defineEmits(['ready'])

const video = useTemplateRef<HTMLVideoElement>('video')

const constraints = {
    video: true,
    audio: false,
}

const { stream, start } = useUserMedia({
    constraints,
})

onMounted(() => {
    start()
})

watchEffect(() => {
    if (video.value) {
        video.value.addEventListener('play', () => {
            emit('ready', video.value)
        })
        video.value.srcObject = stream.value!
    }
})
</script>

<template>
    <div>
        <video ref="video" muted autoplay playsinline loop />
    </div>
</template>
