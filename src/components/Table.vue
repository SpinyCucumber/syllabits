<template>
    <div class="b-table">
        <b-field grouped>
            <b-input
                v-bind="searchOptions"
                v-model="searchTerm"
                type="search"
                icon="magnify"
                rounded/>
            <b-taginput
                v-model="categories"
                ellipsis
                icon="label"
                :placeholder="$translation.get('placeholder.categories')"/>
        </b-field>
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
        entryComponent: {required: true},
        perPage: Number,
    },

    data() {
        return {
            // Buefy starts page numbering at 1 for some reason
            currentPage: 1,
            connection: null,
            categories: [],
            searchTerm: null,
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
        }
    },
}
</script>