<template>
    <div :class="classes">
        <slot/>
    </div>
</template>

<script>
export default {

    name: 'GameDropdown',

    props: {
        trigger: { required: false },
        timeoutDur: { default: 4000 },
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