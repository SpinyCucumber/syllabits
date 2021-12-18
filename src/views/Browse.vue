<template>
    <div>
        <table class="table">
            <tr v-for="entry in entries" :key="entry.id">
                <td><span>{{entry.title}}</span></td>
                <td><span class="has-text-grey">{{entry.author}}</span></td>
                <td>
                    <b-dropdown>
                        <template #trigger>
                            <b-button class="borderless" icon-left="dots-vertical"/>
                        </template>
                        <b-dropdown-item>Play</b-dropdown-item>
                        <b-dropdown-item>Share</b-dropdown-item>
                    </b-dropdown>
                </td>
            </tr>
        </table>
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
        /**
         * This uses a basic "slicing" approach to pagination.
         * The disadvantage is that the server has to iterate through all previous entries
         * to find the request entries.
         * But hey, it's flexible, and simple to implement.
         */
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