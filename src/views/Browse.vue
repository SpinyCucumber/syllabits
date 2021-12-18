<template>
    <div>
        <!-- TODO Use buefy table -->
        <b-table
            :data="entries"
            :columns="columns"
            :selected.sync="selected"
            focusable/>
    </div>
</template>

<script>
import { browsePoems as browsePoemsQuery } from '@/queries'
import { TranslationService, Constants } from '@/services'
import { PoemLocation } from '@/utilities'
import { Connection } from '@/mixins'

const { LocationType } = Constants;

export default {

    name: 'Browse',

    mixins: [ Connection('entries', {
        query: browsePoemsQuery,
        update: data => data.allPoems,
    }) ],
    
    setup() {
        const fields = ['title', 'author'];
        const columns = fields.map(field => ({field, label: TranslationService.get('field.' + field)}));
        return { columns };
    },

    data() {
        return {
            selected: null,
        }
    },

    watch: {
        selected({id}) {
            // When user selects a poem, navigate to the play menu
            const location = new PoemLocation({t: LocationType.DIRECT, p: id}).encode();
            this.$router.push({name: 'Play', params: {location}});
        }
    }
}
</script>