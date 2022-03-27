<template>
    <b-taginput
        v-bind="{ value, ...$attrs }"
        v-on="$listeners"
        icon="label"
        type="is-light"
        autocomplete
        @typing="handleTyping"
        :data="filteredHints"
        :loading="hintsLoading"
        :placeholder="$translation.get('placeholder.categories')"/>
</template>

<script>
import { CategoryHints } from "@/queries"

export default {
    name: 'CategoryInput',
    inheritAttrs: false,

    props: {
        value: Array,
        numHints: { default: 5 },  
    },

    data() {
        return {
            hints: [], // Autocomplete options pulled from server
            hintsLoading: false,
        }
    },

    computed: {
        /**
         * If we are retrieving new hints, the current hints are invalid,
         * and we don't display them
         */
        filteredHints() {
            return this.hintsLoading ? [] : this.categoryHints;
        }
    },

    methods: {
        async handleTyping(text) {
            // Don't handle empty text
            if (!text) return;
            // Retrieve category hints from server
            this.hintsLoading = true;
            const variables = { first: this.numHints, name_Startswith: text.toLowerCase(), name_Nin: this.value };
            let connection = (await this.$apollo.query({
                    query: CategoryHints, fetchPolicy: 'network-only', variables
                })).data.categories;
            this.categoryHints = connection.edges.map(edge => edge.node.name);
            this.hintsLoading = false;
        },
    },
}
</script>