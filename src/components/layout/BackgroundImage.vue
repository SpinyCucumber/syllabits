<template>
    <div :style="style" class="background-image"/>
</template>

<script>
export default {
    name: 'BackgroundImage',
    props: {
        src: String,
    },
    computed: {
        style() {
            return {
                'background-image': `url(${this.src})`,
            };   
        }
    }
}
</script>