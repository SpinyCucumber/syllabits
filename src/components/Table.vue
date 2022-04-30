<template>
    <div class="searchable-table">

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

        <div class="b-table">

            <transition name="fade" mode="out-in">
                <p
                    v-if="connection"
                    class="has-text-grey result-count"
                    :key="totalCount">
                        {{totalCount}} results
                </p>
            </transition>

            <div class="table-wrapper" ref="table">
                <table class="table is-hoverable">
                    <tbody>
                        <component
                            v-for="entry in entries"
                            :key="entry.id"
                            :is="entryComponent"
                            :entry="entry"
                            @refresh="refresh"/>
                    </tbody>
                </table>
                <!-- Limit to container -->
                <b-loading :is-full-page="false" :active="loading"/>
            </div>

            <b-pagination
                v-model="currentPage"
                :total="totalCount"
                :per-page="pageSize"/>
            
        </div>

    </div>
</template>

<script>
import CategoryInput from './CategoryInput'
import { ObserveSize } from '@/mixins'

/**
 * A table, intended for quickly finding specific data from a large set
 * Based on the Buefy table, and uses GraphQL as a backend
 * Supports pagination and searching. Number of entries per page is
 * automatically calculated using height of table.
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
        entryHeight: {default: 57},
    },

    // Observe size of table element so we can update page size
    mixins: [ ObserveSize({ ref: 'table' }), ],

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

    created() {
        /**
         * This uses a basic "slicing" approach to pagination.
         * The disadvantage is that the server has to iterate through all previous entries
         * to find the request entries.
         * But hey, it's flexible, and simple to implement.
         */
        this.$apollo.addSmartQuery('connection', {
            ...this.connectionOptions,
            fetchPolicy: 'cache-and-network',
            skip() {
                // Page size must be defined to run query
                return this.pageSize === undefined;
            },
            variables() {
                return {
                    first: this.currentPage * this.pageSize,
                    last: this.pageSize,
                    ...(this.search ? {search: this.search} : {}),
                    ...(this.categories.length ? {categories_All: this.categories} : {}),
                    orderBy: this.orderBy,
                }
            },
        });
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
        pageSize() {
            return Math.floor(this.tableHeight / this.entryHeight);
        }
    },

    methods: {
        refresh() {
            this.$apollo.queries.connection.refresh();
        }
    }

}
</script>