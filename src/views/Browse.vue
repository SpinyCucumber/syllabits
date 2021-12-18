<template>
    <div>
        <!-- TODO Use buefy table -->
        <b-table :data="entries" :columns="columns" hoverable/>
    </div>
</template>

<script>
import { browsePoems as browsePoemsQuery } from '@/queries'
import { TranslationService } from '@/services'
import { Connection } from '@/mixins'

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
    }
}
</script>