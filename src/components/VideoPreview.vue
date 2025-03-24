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
import { useStorage } from '@vueuse/core'

const models =
    process.env.NODE_ENV === 'production' &&
    process.env.DEPLOY_TARGET === 'github'
        ? '/sample-get-user-media/weights'
        : '/weights'

const props = defineProps<{
    video: HTMLVideoElement
}>()

const myPhotos = useStorage<string[]>('my-photos', [])

const text = ref('aguarde um momento')
const score = ref<number | undefined>(0)
const countdownToTakePhoto = ref(3)
const isDetecting = shallowRef<boolean>()

const stage = shallowRef<Konva.Stage>()
const videoImageBackground = shallowRef<Konva.Image>()
const videoImageCenter = shallowRef<Konva.Image>()
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

    const clipGroup = new Konva.Group({
        clipFunc: (ctx) => {
            if (window.innerWidth > window.innerHeight) {
                ctx.ellipse(
                    screenWidth.value / 2,
                    screenHeight.value / 2.25,
                    screenWidth.value / 4,
                    screenHeight.value / 2.5,
                    0,
                    0,
                    Math.PI * 2
                )
            } else {
                ctx.ellipse(
                    screenWidth.value / 2,
                    screenHeight.value / 2.25,
                    screenWidth.value / 2.5,
                    screenHeight.value / 2.5,
                    0,
                    0,
                    Math.PI * 2
                )
            }
        },
    })

    if (score.value === undefined) {
        text.value = 'CENTRALIZE O ROSTO'
        countdownToTakePhoto.value = 3
    } else if (score.value > 0.5) {
        text.value = 'MANTENHA A POSIÇÃO'

        if (score.value > 0.5) {
            countdownToTakePhoto.value = countdownToTakePhoto.value - 1
        } else {
            countdownToTakePhoto.value = 3
        }
    }

    if (countdownToTakePhoto.value === 0 && preview.value) {
        myPhotos.value.push(preview.value.src)
        text.value = 'FOTO TIRADA'
    }

    textArea.value = new Konva.Text({
        x: 0,
        y: screenHeight.value / 1.125,
        width: screenWidth.value,
        text: text.value,
        fontSize: 20,
        fontStyle: 'bold',
        fontFamily: 'Calibri',
        fill: 'yellow',
        align: 'center',
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
    <div class="flex justify-center container mx-auto max-w-7xl" id="container">
        <div ref="container"></div>
        <!-- Use for debugging-->
        <img
            class="absolute w-0 h-0 top-0 left-0 opacity-0 pointer-events-none"
            ref="preview"
        />
    </div>
</template>
