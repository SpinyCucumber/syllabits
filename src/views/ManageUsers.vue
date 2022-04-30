<template>
    <navbar-view>
        <div class="vertical-grow p-4">
            <Table v-bind="tableOptions" class="vertical-grow"/>
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

const ChangeRole = Vue.component('ChangeRole', {
    props: ['user'],
    render() {
        return (
            <form action="">
                <div class="modal-card" style="width: auto;">
                    <header class="modal-card-head">
                        <p class="modal-card-title">{Translation.get('dialog.user.changerole.title')}</p>
                    </header>
                    <section class="modal-card-body">
                        <b-field label={Translation.get('label.newrole')}>
                            <b-select placeholder={Translation.get('placeholder.user.role')}>
                                {Role.values.map(role => (
                                    <option key={role.valueOf()} value={role.name}>
                                        {Translation.get('role.' + role.name.toLowerCase())}
                                    </option>
                                ))}
                            </b-select>
                        </b-field>
                    </section>
                    <footer class="modal-card-foot">
                        <b-button
                            label={Translation.get('label.cancel')}
                            onClick={this.$emit('close')}/>
                        <b-button
                            label={Translation.get('label.submit')}
                            type="is-primary" />
                    </footer>
                </div>
            </form>
        )
    }
})

const UserEntry = Vue.component('UserEntry', {

    props: { entry: Object },
    components: { RoleTag },

    methods: {
        changeRole() {
            this.$buefy.modal.open({
                parent: this,
                component: ChangeRole,
                hasModalCard: true,
                trapFocus: true,
                props: { user: this.entry },
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

})

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
    }
}
</script>