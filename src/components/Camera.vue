<script setup lang="ts">
import { useTemplateRef, watchEffect } from 'vue'
import { useUserMedia } from '@vueuse/core'

const emits = defineEmits(['ready'])

const video = useTemplateRef<HTMLVideoElement>('video')

const constraints = {
    video: true,
    audio: false,
}

const { stream, start } = useUserMedia({
    constraints,
})

start()

watchEffect(() => {
    if (video.value) {
        video.value.srcObject = stream.value!
        setTimeout(() => {
            emits('ready', video.value)
        }, 500)
    }
})
</script>

<template>
    <div>
        <video ref="video" muted autoplay controls />
    </div>
</template>
