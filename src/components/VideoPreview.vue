<script lang="ts" setup>
import { watchEffect, shallowRef, useTemplateRef } from 'vue'
import Konva from 'konva'
import * as faceapi from 'face-api.js'

const props = defineProps<{
    video: HTMLVideoElement
}>()

const stage = shallowRef<Konva.Stage>()

const container = useTemplateRef<HTMLDivElement>('container')

const loadModels = async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
}

const detectFace = async () => {
    await loadModels() // Aguarda o carregamento do modelo antes da detecção

    const detections = await faceapi
        .detectSingleFace(props.video)
        .withFaceLandmarks()

    console.log(detections)
}
detectFace() // Agora só executa após os modelos carregarem
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

    const screenWidth = 1024
    const screenHeight = 768

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

    const videoImageBackground = new Konva.Image({
        width: screenWidth,
        height: screenHeight,
        image: props.video,
        x: 0,
        y: 0,
        opacity: 0.4,
    })

    const videoImageCenter = new Konva.Image({
        width: screenWidth,
        height: screenHeight,
        image: props.video,
        x: 0,
        y: 0,
    })

    layer.add(videoImageBackground)

    clipGroup.add(videoImageCenter)

    layer.add(clipGroup)

    stage.value.add(layer)

    updateVideo()
})
</script>

<template>
    <div ref="container"></div>
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
