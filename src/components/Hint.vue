<template>
    <transition name="fade">
        <div class="hint" :class="classes" v-show="isActive">
            <slot>
                <div class="hint-content" v-html="message"/>
            </slot>
        </div>
    </transition>
</template>

<script>
export default {

    name: 'Hint',

    props: {
        position: { default: 'is-top' },
        type: { default: 'is-info' },
        direction: { default: 'is-horizontal' },
        message: { default: '' },
    },

    data() {
        return {
            isActive: false,
        }
    },

    computed: {
        classes() {
            return [this.position, this.type, this.direction];
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
            container.classList.add('hint-container');
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