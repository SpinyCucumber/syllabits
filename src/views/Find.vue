<template>
    <b-tabs class="find-view">

        <!-- Should abstract this -->
        <b-tab-item :label="$translation.get('tab.poems')">
            <div class="b-table">
                <div class="table-wrapper">
                    <table class="table is-hoverable">
                        <tbody>
                            <tr v-for="entry in entries" :key="entry.id" @dblclick="play(entry)">
                                <td><span>{{entry.title}}</span></td>
                                <td><span class="has-text-grey">{{entry.author}}</span></td>
                                <td>
                                    <b-dropdown position="is-bottom-left">
                                        <template #trigger>
                                            <b-button class="borderless" icon-left="dots-horizontal"/>
                                        </template>
                                        <b-dropdown-item @click="play(entry)">Play</b-dropdown-item>
                                        <b-dropdown-item>Share</b-dropdown-item>
                                    </b-dropdown>
                                </td>
                            </tr>
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
        </b-tab-item>

        <b-tab-item label="Test"/>
        
    </b-tabs>
</template>

<script>
import { browsePoems as browsePoemsQuery } from '@/queries'
import { TranslationService, Constants } from '@/services'
import { PoemLocation } from '@/utilities'

const { LocationType } = Constants;

export default {

    name: 'Find',
    
    data() {
        return {
            fields: ['title', 'author'],
            perPage: 9,
            // Buefy starts page numbers at 1 for some reason
            currentPage: 1,
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
                   first: this.currentPage * this.perPage,
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

    methods: {
        play({id}) {
            // When user selects a poem, navigate to the play menu
            const location = new PoemLocation({t: LocationType.DIRECT, p: id}).encode();
            this.$router.push({name: 'Play', params: {location}});
        }
    },

}
</script>