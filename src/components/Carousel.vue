<template>
    <transition name="fade-long">
        <background-image
            class="warm"
            :key="index"
            :src="imageSources[index]"/>
    </transition>
</template>

<script>
import BackgroundImage from './BackgroundImage.vue'

export default {

    components: { BackgroundImage },
    name: 'Carousel',

    props: {
        // Array of strings
        imageSources: { require: true },
        period: { default: 8000 },
    },
    data() {
        return {
            index: 0,
        }
    },
    methods: {
        advance() {
            this.index = (this.index + 1) % this.imageSources.length;
        },
    },
    created() {
        // Once component is created, start a recurring task to increment
        // the index
        setInterval(this.advance, this.period);
    },
}
</script>