<template>
    <div class="b-table">
        <b-field grouped>
            <b-field expanded>
                <b-input
                    v-bind="searchOptions"
                    v-model="search"
                    type="search"
                    icon="magnify"
                    rounded/>
            </b-field>
            <b-field expanded v-if="enableCategories">
                <b-taginput
                    v-model="categories"
                    ellipsis
                    type="is-primary"
                    icon="label"
                    autocomplete
                    @typing="handleTyping"
                    :data="displayHints"
                    :loading="hintsLoading"
                    :placeholder="$translation.get('placeholder.categories')"/>
            </b-field>
            <b-field
                label-position="on-border"
                type="is-primary"
                :label="$translation.get('label.sortby')">
                <b-select v-model="orderBy">
                    <option
                        v-for="option in orderByOptions"
                        :key="option"
                        :value="option">
                        {{ $translation.get('option.' + option) }}
                    </option>
                </b-select>
            </b-field>
        </b-field>
        <p class="has-text-grey">{{totalCount}} results</p>
        <div class="table-wrapper">
            <table class="table is-hoverable">
                <tbody>
                    <component
                        v-for="entry in entries"
                        :key="entry.id"
                        :is="entryComponent"
                        :entry="entry"/>
                </tbody>
            </table>
            <!-- Limit to container -->
            <b-loading :is-full-page="false" :active="loading"/>
        </div>
        <b-pagination
            v-model="currentPage"
            :total="totalCount"
            :per-page="perPage"/>
    </div>
</template>

<script>
import { CategoryHints } from "@/queries"

/**
 * A table, intended for quickly finding specific data from a large set
 * Based on the Buefy table, and uses GraphQL as a backend
 * Supports pagination and searching
 */
export default {

    name: 'Table',

    props: {
        connectionOptions: Object,
        searchOptions: Object,
        orderByOptions: Array,
        entryComponent: {required: true},
        enableCategories: {default: false},
        numCategoryHints: {default: 5},
        perPage: Number,
    },

    data() {
        return {
            // Buefy starts page numbering at 1 for some reason
            currentPage: 1,
            connection: null,
            categories: [],
            search: null,
            orderBy: this.orderByOptions[0],
            categoryHints: [], // Autocomplete options pulled from server
            hintsLoading: false,
        }
    },

    created () {
        /**
         * This uses a basic "slicing" approach to pagination.
         * The disadvantage is that the server has to iterate through all previous entries
         * to find the request entries.
         * But hey, it's flexible, and simple to implement.
         */
        this.$apollo.addSmartQuery('connection', {
            ...this.connectionOptions,
            variables() {
                return {
                   first: this.currentPage * this.perPage,
                   last: this.perPage,
                   search: this.search,
                   orderBy: this.orderBy,
                }
            },
        })
    },

    computed: {
        entries() {
            return this.connection?.edges.map(edge => edge.node);
        },
        totalCount() {
            return this.connection?.totalCount;
        },
        loading() {
            return this.$apollo.queries.connection.loading;
        },
        // If we are retrieving new hints, the current hints are invalid,
        // and we don't display them
        displayHints() {
            return this.hintsLoading ? [] : this.categoryHints;
        }
    },

    methods: {
        handleTyping(text) {
            // Don't handle empty text
            if (!text) return;
            // Retrieve category hints from server
            this.hintsLoading = true;
            this.$apollo.query({
                query: CategoryHints,
                variables: {first: this.numCategoryHints, name_Startswith: text.toLowerCase()}}
            )
            .then(result => result.data.categories)
            .then(connection => {
                this.categoryHints = connection.edges.map(edge => edge.node.name);
                this.hintsLoading = false;
            })
        }
    },

}
</script>