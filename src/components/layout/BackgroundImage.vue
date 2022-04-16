<template>
    <div :style="style" :class="classes"/>
</template>

<script>
export default {
    name: 'BackgroundImage',
    props: {
        src: String,
        stretched: { default: false },
    },
    computed: {
        style() {
            return {
                'background-image': `url(${this.src})`,
            };   
        },
        classes() {
            let classes = ['background-image'];
            if (this.stretched) classes.push('stretched');
            return classes;
        }
    }
}
</script>