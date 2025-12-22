<script lang="ts" setup>
import {
    watchEffect,
    shallowRef,
    useTemplateRef,
    ref,
    computed,
    onUnmounted,
} from 'vue'
import Konva from 'konva'
import * as faceapi from 'face-api.js'

const models =
    process.env.NODE_ENV === 'production' &&
    process.env.DEPLOY_TARGET === 'github'
        ? '/sample-get-user-media/weights'
        : '/weights'

const props = defineProps<{
    video: HTMLVideoElement
}>()

const text = ref('aguarde um momento')
const score = ref<number | undefined>(0)
const isDetecting = shallowRef<boolean>()

const stage = shallowRef<Konva.Stage>()
const videoImageBackground = shallowRef<Konva.Image>()
const textArea = shallowRef<Konva.Text>()

const container = useTemplateRef<HTMLDivElement>('container')
const preview = useTemplateRef<HTMLImageElement>('preview')

const screenWidth = computed(() => {
    if (props.video.videoWidth > window.innerWidth) {
        return window.innerWidth
    }
    return props.video.videoWidth
})

const screenHeight = computed(() => {
    if (props.video.videoWidth > window.innerWidth) {
        return (
            (props.video.videoHeight / props.video.videoWidth) *
            screenWidth.value
        )
    }
    return props.video.videoHeight
})

console.log(screenHeight.value, props.video.videoWidth, window.innerWidth)

const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri(models)
}

const detectFace = () => {
    if (isDetecting.value) {
        return
    }

    isDetecting.value = true

    if (videoImageBackground.value && preview.value) {
        const x = screenWidth.value
        const y = screenHeight.value
        const width = screenWidth.value
        const height = screenHeight.value

        videoImageBackground.value.toImage({
            x,
            y,
            width,
            height,
            callback: (image) => {
                // DEBUG
                if (preview.value) {
                    preview.value.src = image.src
                }

                faceapi
                    .tinyFaceDetector(
                        image,
                        new faceapi.TinyFaceDetectorOptions()
                    )
                    .then((detections) => {
                        setTimeout(() => {
                            score.value = detections[0]?.score
                            console.log(detections)
                            URL.revokeObjectURL(image.src)
                            isDetecting.value = false
                            requestAnimationFrame(detectFace)
                        }, 500)
                    })
            },
        })
    }
}
const updateVideo = () => {
    if (stage.value) {
        stage.value.batchDraw()
        requestAnimationFrame(updateVideo)
    }
}

onUnmounted(() => {
    isDetecting.value = true // Impede novas execuções de detectFace
})

watchEffect(() => {
    if (!container.value) {
        return false
    }

    stage.value = new Konva.Stage({
        container: container.value,
        width: screenWidth.value,
        height: screenHeight.value,
    })

    const layer = new Konva.Layer()

    videoImageBackground.value = new Konva.Image({
        width: screenWidth.value,
        height: screenHeight.value,
        image: props.video,
        x: 0,
        y: 0,
    })

    layer.add(videoImageBackground.value)

    stage.value.add(layer)

    updateVideo()
    detectFace()
})

await loadModels() // Aguarda o carregamento do modelo antes da detecção
</script>

<template>
    <div class="flex justify-center container mx-auto max-w-7xl" id="container">
        <div ref="container"></div>
        <!-- Use for debugging-->
        <img
            class="absolute w-0 h-0 top-0 left-0 opacity-0 pointer-events-none"
            ref="preview"
        />
    </div>
</template>
