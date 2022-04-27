<template>
    <navbar-view class="manage-users-view">
        <div class="manage-users-content">
            <Table v-bind="tableOptions" class="manage-users-table"/>
        </div>
    </navbar-view>
</template>

<script>
import Vue from 'vue'
import NavbarView from './NavbarView'
import { Translation } from '@/services'
import { Table } from '@/components'
import { SearchUsers } from '@/queries'

const UserEntry = Vue.component('UserEntry', {
    props: { entry: Object },
    render() {
        return (
            <tr>
                <td><span>{this.entry.email}</span></td>
                <td>
                    <b-dropdown position="is-bottom-left" scopedSlots={
                        {
                            trigger() {
                                return (<b-button class="borderless" icon-left="dots-horizontal"/>);
                            }
                        }}>
                    </b-dropdown>
                </td>
            </tr>
        )
    },
})

export default {
    name: 'ManageUsers',
    components: { NavbarView, Table, },
    setup() {
        return {
            tableOptions: {
                orderByOptions: ['relevance', 'email'],
                connectionOptions: { query: SearchUsers, update: (data) => data.users, },
                searchOptions: { placeholder: Translation.get('placeholder.user.search'), },
                entryComponent: UserEntry,
            }
        }
    }
}
</script>