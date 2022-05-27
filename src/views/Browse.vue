<template>
    <navbar-view>
        <b-tabs :value="tab" @input="onTabChange">
            <b-tab-item
                class="vertical-grow"
                v-for="tab in tabs"
                :key="tab.value"
                :label="$translation.get('tab.' + tab.value)"
                v-bind="tab">
                <Table v-bind="tab.tableOptions" class="vertical-grow"/>
            </b-tab-item>
        </b-tabs>
    </navbar-view>
</template>

<script>
import { SearchPoems, SearchUsers } from '@/queries'
import { Translation } from '@/services'
import { Table, PoemEntry, UserEntry } from '@/components'
import NavbarView from './NavbarView'

const poemTab = {
    value: 'poems',
    tableOptions: {
        connectionOptions: { query: SearchPoems, update: data => data.poems },
        searchOptions: { placeholder: Translation.get('placeholder.poem.search') },
        orderByOptions: ['relevance', 'title', 'author'],
        enableCategories: true,
        entryComponent: PoemEntry,
    },
};

const userTab = {
    value: 'users',
    tableOptions: {
        orderByOptions: ['relevance', 'email', 'role'],
        connectionOptions: { query: SearchUsers, update: (data) => data.users, },
        searchOptions: { placeholder: Translation.get('placeholder.user.search'), },
        entryComponent: UserEntry,
    }
}

export default {

    name: 'Find',
    components: { NavbarView, Table },
    props: { tab: String },

    computed: {
        tabs() {
            let tabs = [poemTab];
            if (this.$store.getters.perms.has('user.manage'))
                tabs.push(userTab);
            return tabs;
        }
    },

    methods: {
        onTabChange(value) {
            this.$router.push({ name: 'Browse', query: { tab: value }});
        }
    }

}
</script>