<template>
    <div class="note" :class="classes">
        {{ message }}
    </div>
</template>

<script>
export default {
    name: 'Note',
    props: {
        position: { default: 'is-top' },
        type: { default: 'is-info' },
        message: { default: '' },
    },
    computed: {
        classes() {
            return [this.position, this.type];
        },
    }
}
</script>