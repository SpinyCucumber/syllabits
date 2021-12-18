<template>
    <div>
        <!-- TODO Use buefy table -->
        <b-table
            :loading="loading"
            :data="entries"
            :columns="columns"
            :selected.sync="selected"

            :total="totalCount"
            :per-page="perPage"
            :current-page.sync="currentPage"
            paginated
            backend-pagination
            focusable/>
    </div>
</template>

<script>
import { browsePoems as browsePoemsQuery } from '@/queries'
import { TranslationService, Constants } from '@/services'
import { PoemLocation } from '@/utilities'

const { LocationType } = Constants;

export default {

    name: 'Browse',
    
    data() {
        return {
            fields: ['title', 'author'],
            selected: null,
            perPage: 10,
            currentPage: 0,
        }
    },

    apollo: {
        connection: {
            query: browsePoemsQuery,
            update: data => data.allPoems,
            variables() {
                return {
                   first: (this.currentPage + 1) * this.perPage,
                   last: this.perPage,
                }
            },
        }
    },

    computed: {
        entries() {
            return this.connection?.edges.map(edge => edge.node);
        },
        totalCount() {
            return this.connection?.totalCount;
        },
        columns() {
            return this.fields.map(field => ({field, label: TranslationService.get('field.' + field)}));
        },
        loading() {
            return this.$apollo.queries.connection.loading;
        }
    },

    watch: {
        selected({id}) {
            // When user selects a poem, navigate to the play menu
            const location = new PoemLocation({t: LocationType.DIRECT, p: id}).encode();
            this.$router.push({name: 'Play', params: {location}});
        }
    },

}
</script>