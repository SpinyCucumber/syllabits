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
import { Translation, Constants } from '@/services'
import { Table, RoleTag } from '@/components'
import { SearchUsers } from '@/queries'
const { Role } = Constants;

const UserEntry = Vue.component('UserEntry', {
    props: { entry: Object },
    components: { RoleTag },
    render() {
        let role = Role[this.entry.role];
        return (
            <tr class="user-entry">
                <td><span>{this.entry.email}</span></td>
                <td class="column-grow">{role !== Role.USER ? <RoleTag role={role}/> : null}</td>
                <td class="column-shrink">
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