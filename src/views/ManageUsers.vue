<template>
    <navbar-view>
        <div class="vertical-grow p-4">
            <Table v-bind="tableOptions" class="vertical-grow"/>
        </div>
    </navbar-view>
</template>

<script>
import NavbarView from './NavbarView'
import { Translation, Constants } from '@/services'
import { Table, RoleTag, ChangeRole } from '@/components'
import { SearchUsers } from '@/queries'
const { Role } = Constants;

const UserEntry = {

    props: { entry: Object },
    components: { RoleTag },

    methods: {
        changeRole() {
            this.$buefy.modal.open({
                parent: this,
                component: ChangeRole,
                hasModalCard: true,
                props: { user: this.entry },
                trapFocus: true,
            })
        },
        delete() {
            // TODO
        },
    },

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
                        <b-dropdown-item onClick={this.changeRole}>
                            {Translation.get('button.user.changerole')}
                        </b-dropdown-item>
                        <b-dropdown-item onClick={this.delete} class="has-text-danger">
                            {Translation.get('button.user.delete')}
                        </b-dropdown-item>
                    </b-dropdown>
                </td>
            </tr>
        )
    },

}

export default {
    name: 'ManageUsers',
    components: { NavbarView, Table, },
    setup() {
        return {
            tableOptions: {
                orderByOptions: ['relevance', 'email', 'role'],
                connectionOptions: { query: SearchUsers, update: (data) => data.users, },
                searchOptions: { placeholder: Translation.get('placeholder.user.search'), },
                entryComponent: UserEntry,
            }
        }
    },
}
</script>