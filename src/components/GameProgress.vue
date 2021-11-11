<template>
    <div :class="classes" :style="{ '--progress': progress }">
        <div class="inner"/>
    </div>
</template>

<script>
export default {

    props: {
        maxValue: Number,
        value: Number,
        rounded: Boolean,
        type: String,
    },

    computed: {
        progress() {
            return String(this.value / this.maxValue);
        },
        classes() {
            let classes = ['game-progress', this.type];
            if (this.rounded) classes.push('rounded');
            return classes;
        }
    }

}
</script>