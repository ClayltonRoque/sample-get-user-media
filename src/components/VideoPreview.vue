<script lang="ts" setup>
import { watchEffect, shallowRef, useTemplateRef } from 'vue'
import Konva from 'konva'
import * as faceapi from 'face-api.js'

const props = defineProps<{
    video: HTMLVideoElement
}>()

const models = '/weights'

const stage = shallowRef<Konva.Stage>()
const videoImageBackground = shallowRef<Konva.Image>()
const videoImageCenter = shallowRef<Konva.Image>()

const container = useTemplateRef<HTMLDivElement>('container')
const preview = useTemplateRef<HTMLImageElement>('preview')

const screenWidth = 1024
const screenHeight = 768

const loadModels = async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri(models)
    await faceapi.nets.faceLandmark68Net.loadFromUri(models)
}

const detectFace = () => {
    if (videoImageCenter.value && preview.value) {
        const x = screenWidth / 4
        const y = screenHeight / 10
        const width = screenWidth / 2
        const height = screenHeight / 1.25

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
        width: screenWidth,
        height: screenHeight,
    })

    const layer = new Konva.Layer()

    const clipGroup = new Konva.Group({
        clipFunc: (ctx) => {
            ctx.ellipse(
                screenWidth / 2,
                screenHeight / 2.25,
                screenWidth / 4,
                screenHeight / 2.5,
                0,
                0,
                Math.PI * 2
            )
        },
    })

    videoImageBackground.value = new Konva.Image({
        width: screenWidth,
        height: screenHeight,
        image: props.video,
        x: 0,
        y: 0,
        opacity: 0.4,
    })

    videoImageCenter.value = new Konva.Image({
        width: screenWidth,
        height: screenHeight,
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
