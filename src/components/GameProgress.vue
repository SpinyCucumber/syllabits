<template>
    <div class="game-progress is-rounded" :style="{ '--progress': progress }">
        <div class="inner"/>
    </div>
</template>

<script>
export default {

    props: {
        maxValue: Number,
        value: Number,
    },

    computed: {
        progress() {
            return String(this.value / this.maxValue);
        },
    }

}
</script>