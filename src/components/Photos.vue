<template>
    <div class="grid grid-cols-4 gap-4 p-4">
        <div v-for="(_, index) in 10" :key="index">
            <img class="col-span-1" src="/frieren.jpg" alt="Frieren" />
        </div>
    </div>
</template>
