<template>
    <div :class="{'game-progress': true, rounded: rounded}" :style="{ '--progress': progress }">
        <div class="inner"/>
    </div>
</template>

<script>
export default {

    props: {
        maxValue: Number,
        value: Number,
        rounded: Boolean,
    },

    computed: {
        progress() {
            return String(this.value / this.maxValue);
        },
    }

}
</script>