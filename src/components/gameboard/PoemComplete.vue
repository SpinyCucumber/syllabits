<template>
    <div class="modal-simple">
        <header class="modal-simple-head">
            <p class="modal-simple-title">{{ $translation.get("play.complete") }}</p>
        </header>
        <footer class="modal-simple-foot">
            <b-button v-for="button in buttons"
                :key="button.key"
                :label="$translation.get('button.' + button.key)"
                v-bind="button.options"
                v-on="button.listeners"/>
        </footer>
    </div>
</template>

<script>
/**
 * A component that renders a "poem complete" dialog
 * Can be easily connected to a Buefy modal
 */
export default {

    name: 'PoemComplete',

    computed: {
        buttons() {
            let buttons = [
                {
                    key: 'anotherpoem', 
                    options: {
                        tag: 'router-link',
                        type: 'is-primary',
                        to: { name: 'RandomPoem' },
                        label: this.$translation.get('button.anotherpoem'),
                    },
                },
            ];
            if (this.$store.getters.hasIdentity) buttons = [...buttons, {
                key: 'dashboard',
                options: {
                    tag: 'router-link',
                    type: 'is-primary',
                    to: { name: 'Dashboard' },
                    label: this.$translation.get('button.dashboard'),
                },
            }];
            return buttons;
        },
    },

}
</script>

<style>

</style>