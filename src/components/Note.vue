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
    },
    methods: {
        attach(container) {
            // Create new element and attach to parent
            // We also add a class to the parent to mark it as a container
            container.classList.add('note-container');
            const el = document.createElement('div');
            container.appendChild(el);
            this.$mount(el);
        },
    }
}
</script>