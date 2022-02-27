<template>
    <transition name="fade">
        <div class="note" :class="classes" v-show="isActive">
            {{ message }}
        </div>
    </transition>
</template>

<script>
export default {

    name: 'Note',

    props: {
        position: { default: 'is-top' },
        type: { default: 'is-info' },
        message: { default: '' },
    },

    data() {
        return {
            isActive: false,
        }
    },

    computed: {
        classes() {
            return [this.position, this.type];
        },
    },

    mounted() {
        this.isActive = true;
    },

    methods: {

        attach(elementOrSelector) {
            // If selector was supplied, evaluate selector to find container element
            const container = (typeof elementOrSelector === 'string') ?
                document.querySelector(elementOrSelector) : elementOrSelector;
            // Create new element and attach to parent
            // We also add a class to the parent to mark it as a container
            container.classList.add('note-container');
            const el = document.createElement('div');
            container.appendChild(el);
            this.$mount(el);
        },

        close() {
            this.isActive = false;
             // Timeout for the animation complete before destroying
            setTimeout(() => {
                this.$destroy()
                this.$el.remove();
            }, 250);
        }

    }

}
</script>