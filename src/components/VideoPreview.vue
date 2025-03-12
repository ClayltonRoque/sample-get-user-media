<script lang="ts" setup>
import { onMounted } from 'vue'
import Konva from 'konva'

const props = defineProps<{
    video: HTMLVideoElement
}>()

onMounted(() => {
    const width = window.innerWidth
    const height = window.innerHeight

    const stage = new Konva.Stage({
        container: 'container',
        width: width,
        height: height,
    })

    const layer = new Konva.Layer()

    // Grupo para aplicar o molde
    const clipGroup = new Konva.Group({
        clipFunc: (ctx) => {
            // Criando a elipse como máscara
            ctx.beginPath()
            ctx.ellipse(width / 2, height / 2, 150, 200, 0, 0, Math.PI * 2)
            ctx.closePath()
        },
    })

    // Vídeo (Imagem) dentro do grupo com o molde (com opacidade normal)
    const videoImageCenter = new Konva.Image({
        width: window.innerWidth,
        height: window.innerHeight,
        image: props.video,
        x: 0,
        y: 0,
    })

    // Adicionando o vídeo central no grupo com o molde
    clipGroup.add(videoImageCenter)

    // Vídeo fora do molde (com opacidade reduzida)
    const videoImageBackground = new Konva.Image({
        width: window.innerWidth / 2,
        height: window.innerHeight / 2,
        image: props.video,
        x: 600,
        y: 300,
        opacity: 0.2, // Opacidade reduzida para a parte fora do molde
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

    // Adiciona o vídeo de fundo (opacidade reduzida) na camada
    layer.add(videoImageBackground)

    // Adiciona o grupo com o vídeo central no grupo com o molde
    layer.add(clipGroup)

    // Adiciona a camada no stage
    stage.add(layer)
})
</script>

<template>
    <div id="container"></div>
</template>
