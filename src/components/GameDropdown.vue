<template>
    <div :class="classes">
        <div class="inner">
            <slot/>
        </div>
        <button class="handle" v-if="hasHandle" @click="open = !open">
            <div class="mdi mdi-chevron-down handle-icon"/>
        </button>
    </div>
</template>

<script>
export default {

    name: 'GameDropdown',

    props: {
        trigger: { required: false },
        timeoutDur: { default: 4000 },
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