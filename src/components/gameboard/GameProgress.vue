<template>
    <div :class="['game-progress', type]" :style="{ '--progress': progress }">
        <div class="inner"/>
    </div>
</template>

<script>
export default {

    props: {
        maxValue: Number,
        value: Number,
        type: String,
    },

    computed: {
        progress() {
            return String(this.value / this.maxValue);
        },
    }

}
</script>