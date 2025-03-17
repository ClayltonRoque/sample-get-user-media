<script lang="ts" setup>
import { watchEffect, shallowRef, useTemplateRef, computed } from 'vue'
import Konva from 'konva'
import * as faceapi from 'face-api.js'

const props = defineProps<{
    video: HTMLVideoElement
}>()

const models =
    process.env.NODE_ENV === 'production' &&
    process.env.DEPLOY_TARGET === 'github'
        ? '/sample-get-user-media/weights'
        : '/weights'

const stage = shallowRef<Konva.Stage>()
const videoImageBackground = shallowRef<Konva.Image>()
const videoImageCenter = shallowRef<Konva.Image>()

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

const loadModels = async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri(models)
    await faceapi.nets.faceLandmark68Net.loadFromUri(models)
}

const detectFace = () => {
    if (videoImageCenter.value && preview.value) {
        const x = screenWidth.value / 4
        const y = screenHeight.value / 10
        const width = screenWidth.value / 2
        const height = screenHeight.value / 1.25

        videoImageCenter.value.toImage({
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
                    .detectSingleFace(image)
                    .withFaceLandmarks()
                    .run()
                    .then((detections) => {
                        setTimeout(() => {
                            console.log(detections)
                            URL.revokeObjectURL(image.src)
                            requestAnimationFrame(detectFace)
                        }, 1000)
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

    const clipGroup = new Konva.Group({
        clipFunc: (ctx) => {
            ctx.ellipse(
                screenWidth.value / 2,
                screenHeight.value / 2.25,
                screenWidth.value / 4,
                screenHeight.value / 2.5,
                0,
                0,
                Math.PI * 2
            )
        },
    })

    videoImageBackground.value = new Konva.Image({
        width: screenWidth.value,
        height: screenHeight.value,
        image: props.video,
        x: 0,
        y: 0,
        opacity: 0.4,
    })

    videoImageCenter.value = new Konva.Image({
        width: screenWidth.value,
        height: screenHeight.value,
        image: props.video,
        x: 0,
        y: 0,
    })

    layer.add(videoImageBackground.value)

    clipGroup.add(videoImageCenter.value)

    layer.add(clipGroup)

    stage.value.add(layer)

    updateVideo()
    detectFace()

    console.log(detectFace)
})

await loadModels() // Aguarda o carregamento do modelo antes da detecção
</script>

<template>
    <div>
        <div ref="container"></div>
        <!-- Use for debugging-->
        <img ref="preview" />
    </div>
</template>

<style>
#container {
    .konvajs-content {
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
    }
    canvas {
        border-radius: 20px;
        position: static !important;
        width: 800px !important;
        height: 800px !important;
    }
}
</style>
