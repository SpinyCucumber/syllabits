<template>
    <transition-group tag="div">
        <background-image
            v-for="src in toDisplay"
            :key="src"
            :src="src"/>
    </transition-group>
</template>

<script>
import BackgroundImage from './BackgroundImage.vue'

export default {

    components: { BackgroundImage },
    name: 'Carousel',

    props: {
        // Array of strings
        imageSrcs: { require: true },
        period: { default: 5 },
    },
    data() {
        return {
            index: 0,
        }
    },
    computed: {
        toDisplay() {
            return [this.imageSrcs[this.index]];
        }
    },
    methods: {
        advance() {

        },
    }
}
</script>