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
const textArea = shallowRef<Konva.Text>()

const text = ref('simple text')
const score = shallowRef<number | undefined>(0)

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

let isDetecting = false

const detectFace = () => {
    if (isDetecting) {
        return
    }

    isDetecting = true

    if (videoImageCenter.value && preview.value) {
        const x = screenWidth.value / 4
        const y = screenHeight.value / 20
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
                            console.log(detections?.detection.score)
                            score.value = detections?.detection.score

                            URL.revokeObjectURL(image.src)
                            isDetecting = false
                            requestAnimationFrame(detectFace)
                        }, 200)
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
    isDetecting = true // Impede novas execuções de detectFace
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

    if (score.value === undefined) {
        text.value = 'Camera indisponível'
    } else if (score.value < 0.8) {
        text.value =
            'posicione a camera de forma que seu rosto fique centralizado'
    } else if (score.value > 0.95) {
        text.value = 'segure a posição por 3 segundos'
    }

    textArea.value = new Konva.Text({
        x: screenWidth.value / 7,
        y: screenHeight.value / 1.15,
        text: text.value,
        fontSize: 14,
        fontFamily: 'Calibri',
        fill: 'green',
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

    layer.add(textArea.value)

    clipGroup.add(videoImageCenter.value)

    layer.add(clipGroup)

    stage.value.add(layer)

    updateVideo()
    detectFace()
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
