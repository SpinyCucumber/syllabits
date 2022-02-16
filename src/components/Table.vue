<template>
    <div>
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
                <category-input v-model="categories"/>
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
        <div class="b-table" v-if="connection">
            <transition name="fade" mode="out-in">
                <p class="has-text-grey" :key="totalCount">{{totalCount}} results</p>
            </transition>
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
    </div>
</template>

<script>
import CategoryInput from './CategoryInput'

/**
 * A table, intended for quickly finding specific data from a large set
 * Based on the Buefy table, and uses GraphQL as a backend
 * Supports pagination and searching
 */
export default {

    name: 'Table',
    components: { CategoryInput },

    props: {
        connectionOptions: Object,
        searchOptions: Object,
        orderByOptions: Array,
        entryComponent: {required: true},
        enableCategories: {default: false},
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
            fetchPolicy: 'cache-and-network',
            variables() {
                return {
                   first: this.currentPage * this.perPage,
                   last: this.perPage,
                   ...(this.search ? {search: this.search} : {}),
                   ...(this.categories.length ? {categories_All: this.categories} : {}),
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
    },

}
</script>