<template>
    <div class="b-table">
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
export default {

    name: 'Search',

    props: {
        connectionOptions: Object,
        entryComponent: {required: true},
        perPage: Number,
    },

    data() {
        return {
            // Buefy starts page numbering at 1 for some reason
            currentPage: 1,
            connection: null,
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