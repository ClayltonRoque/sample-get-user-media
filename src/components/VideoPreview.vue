<script lang="ts" setup>
import { onMounted } from 'vue'
import Konva from 'konva'

const props = defineProps<{
    video: HTMLVideoElement
}>()

onMounted(() => {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    const stage = new Konva.Stage({
        container: 'container',
        width: screenWidth,
        height: screenHeight,
    })

    const layer = new Konva.Layer()

    const clipGroup = new Konva.Group({
        clipFunc: (ctx) => {
            ctx.ellipse(
                screenWidth / 2,
                screenHeight / 2,
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
        opacity: 0.4, // Opacidade reduzida para a parte fora do molde
    })

    const videoImageCenter = new Konva.Image({
        width: screenWidth,
        height: screenHeight,
        image: props.video,
        x: 0,
        y: 0,
    })

    // Função para atualizar o vídeo no canvas
    const updateVideo = () => {
        if (!props.video.paused && !props.video.ended) {
            videoImageBackground.cache() // Cache para otimizar
            videoImageBackground.getLayer()?.batchDraw() // Redesenha a camada
            videoImageCenter.cache() // Cache para otimizar
            videoImageCenter.getLayer()?.batchDraw() // Redesenha a camada
        }
    }

    // Loop de atualização para cada frame do vídeo
    props.video.addEventListener('play', () => {
        const interval = setInterval(() => {
            updateVideo()
        }, 1000 / 60) // Aprox. 60 fps

        // Para de atualizar quando o vídeo for pausado ou terminado
        props.video.addEventListener('pause', () => clearInterval(interval))
        props.video.addEventListener('ended', () => clearInterval(interval))
    })

    // Inicia a atualização assim que o vídeo começar a reproduzir
    if (!props.video.paused && !props.video.ended) {
        updateVideo()
    }

    layer.add(videoImageBackground)

    clipGroup.add(videoImageCenter)

    layer.add(clipGroup)

    stage.add(layer)
})
</script>

<template>
    <div id="container"></div>
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
