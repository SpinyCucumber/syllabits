<template>
    <tr @dblclick="view">
        <td><span>{{ entry.name }}</span></td>
        <td><span class="has-text-grey">{{ displayPath }}</span></td>
        <td class="column-grow"><span v-if="!entry.public">
            <b-tooltip :label="$translation.get('hint.page.notpublic')" position="is-right">
                <b-icon icon="eye-off" type="is-primary"/>
            </b-tooltip>
        </span></td>
        <td class="column-shrink">
            <b-dropdown position="is-bottom-left">
                <template #trigger>
                    <b-button class="borderless" icon-left="dots-horizontal"/>
                </template>
                <b-dropdown-item @click="view" class="has-text-primary">
                    {{ $translation.get('button.page.view') }}
                </b-dropdown-item>
                <b-dropdown-item @click="edit" v-if="$store.getters.perms.has('page.edit')">
                    {{ $translation.get('button.page.edit') }}
                </b-dropdown-item>
            </b-dropdown>
        </td>
    </tr>
</template>

<script>
export default {
    props: { entry: Object },
    methods: {
        view() {
            this.$router.push({ name: 'Page', params: { path: this.entry.path }});
        },
        edit() {
            this.$router.push({ name: 'Page', params: { path: this.entry.id }, query: { mode: 'edit' }});
        },
    },
    computed: {
        displayPath() {
            return `/page/${this.entry.path}`
        }
    }
}
</script>