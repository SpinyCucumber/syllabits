<template>
    <div class="game-progress">
        <div class="inner" :style="{ width: width }">

        </div>
    </div>
</template>

<script>
export default {

    props: {
        maxValue: Number,
        value: Number,
    },

    computed: {
        width() {
            return `${(this.value / this.maxValue) * 100}%`;
        }
    }

}
</script>