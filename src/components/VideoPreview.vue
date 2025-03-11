<script lang="ts" setup>
import { ref, watchEffect } from 'vue'

const props = defineProps<{
    video: HTMLVideoElement
}>()

const canvas = ref<HTMLCanvasElement | null>(null)

watchEffect(() => {
    if (canvas.value) {
        capturarQuadro()
    }
})

function desenharMolde() {
    if (canvas.value) {
        const ctx = canvas.value.getContext('2d')
        if (ctx) {
            ctx.drawImage(
                props.video,
                0,
                0,
                canvas.value.width,
                canvas.value.height
            )

            // Desenhado backdrop
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
            ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

            // Retângulo para o corpo
            const bodyWidth = canvas.value.width / 2
            const bodyHeight = canvas.value.height / 2
            const bodyX = (canvas.value.width - bodyWidth) / 2
            const bodyY = (canvas.value.height - bodyHeight) / 2

            ctx.beginPath()
            ctx.stroke()
            ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight)

            const aspectWidth =
                (canvas.value.height / canvas.value.width) * bodyWidth

            const aspectHeight =
                (canvas.value.height / canvas.value.width) * bodyHeight

            const aspectX = bodyWidth - aspectWidth
            const aspectY = bodyHeight - aspectHeight

            ctx.drawImage(
                props.video,
                aspectX,
                aspectY,
                aspectWidth,
                aspectHeight,
                bodyX,
                bodyY,
                bodyWidth,
                bodyHeight
            )

            ctx.strokeStyle = 'cyan'
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.rect(bodyX, bodyY, bodyWidth, bodyHeight)
            ctx.stroke()
        }
    }
}

function desenharOverlay() {
    if (canvas.value) {
        const ctx = canvas.value.getContext('2d')
        if (ctx) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
            ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
        }
    }
}

function capturarQuadro() {
    if (!canvas.value || !props.video) return

    // const ctx = canvas.value.getContext('2d')
    // if (ctx) {
    //     // ctx.drawImage(
    //     //     props.video,
    //     //     0,
    //     //     0,
    //     //     canvas.value.width,
    //     //     canvas.value.height
    //     // )
    // }
    desenharMolde()

    requestAnimationFrame(capturarQuadro)
}
</script>

<template>
    <div class="relative">
        <canvas ref="canvas" width="1024" height="768" class="static block" />
    </div>
</template>
