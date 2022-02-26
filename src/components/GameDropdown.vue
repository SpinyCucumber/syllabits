<template>
    <div :class="classes">
        <div class="inner">
            <slot/>
        </div>
        <div class="handle-area" ref="handleArea">
            <b-button
                icon-left="chevron-down"
                class="borderless handle"
                size="is-large"
                v-if="hasHandle"
                @click="open = !open"/>
        </div>
    </div>
</template>

<script>
export default {

    name: 'GameDropdown',

    props: {
        trigger: { required: false },
        timeoutDur: { default: 2000 },
        hasHandle: { default: false },
    },

    data() {
        return {
            open: false    
        }
    },

    computed: {
        classes() {
            let classes = ['game-dropdown'];
            if (this.open) classes.push('open');
            if (this.hasHandle) classes.push('has-handle');
            return classes;
        }
    },

    methods: {
        extend() {
            // Whenever the trigger changes, open the dropdown and start the timeout for closing it.
            // If there is already a timeout, cancel it
            if (this.timeout) clearTimeout(this.timeout);
            else this.open = true;
            // Create new timeout
            this.timeout = setTimeout(this.close, this.timeoutDur);
        },
        close() {
            this.open = false;
            this.timeout = null;
        },
    },

    watch: {
        trigger() {
            this.extend();
        }
    }

}
</script>