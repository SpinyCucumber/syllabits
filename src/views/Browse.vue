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
import { SearchPoems, SearchUsers, DeleteUser } from '@/queries'
import { Constants, Translation } from '@/services'
import { PoemLocation } from '@/utilities'
import { Table, RoleTag, ChangeRole } from '@/components'
import NavbarView from './NavbarView'

const { LocationType, Role } = Constants;

const PoemEntry = {
    props: { entry: Object },
    methods: {
        dropdownItems() {
            let dropdownItems = [
                <b-dropdown-item onClick={this.play} class="has-text-primary">
                    {Translation.get('button.poem.play')}
                </b-dropdown-item>,
                <b-dropdown-item onClick={this.share}>
                    {Translation.get('button.poem.share')}
                </b-dropdown-item>
            ];
            if (this.$store.getters.perms.has('poem.edit')) dropdownItems = [...dropdownItems, 
                <b-dropdown-item onClick={this.edit}>
                    {Translation.get('button.poem.edit')}
                </b-dropdown-item>
            ];
            return dropdownItems;
        },
        play() {
            // When user selects a poem, navigate to the play menu
            const location = new PoemLocation({t: LocationType.DIRECT, p: this.entry.id}).encode();
            this.$router.push({name: 'Gameboard', query: { location }});
        },
        edit() {
            this.$router.push({name: 'Gameboard', query: { mode: 'edit', poemID: this.entry.id }});
        },
        share() {
            // Construct play URL and write to clipboard
            const location = new PoemLocation({t: LocationType.DIRECT, p: this.entry.id}).encode();
            const url = window.location.origin + '/#/play/' + location;
            navigator.clipboard.writeText(url);
            // Show success message
            this.$buefy.toast.open({
                message: this.$translation.get('message.poem.share'),
                type: 'is-success',
            })
        }
    },
    render() {
        return (
            <tr onDblclick={this.play}>
                <td><span>{this.entry.title}</span></td>
                <td class="column-grow"><span class="has-text-grey">{this.entry.author}</span></td>
                <td class="column-shrink">
                    <b-dropdown position="is-bottom-left" scopedSlots={
                        {
                            trigger() {
                                return (<b-button class="borderless" icon-left="dots-horizontal"/>);
                            }
                        }}>
                        {this.dropdownItems()}
                    </b-dropdown>
                </td>
            </tr>
        )
    },
}

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
        async confirmDelete() {
            this.$buefy.dialog.confirm({
                ...this.$translation.get('dialog.user.delete'),
                message: `Are you sure you to delete the user ${this.entry.email}?`,
                type: 'is-danger',
                hasIcon: true,
                onConfirm: this.delete,
            });
        },
        async delete() {
            const variables = { id: this.entry.id };
            let { ok } = (await this.$apollo.mutate({ mutation: DeleteUser, variables })).data.deleteUser;
            // If we've successfully deleted the user, show a nice message and delete the user locally
            if (ok) {
                this.$buefy.toast.open({
                    message: this.$translation.get('message.user.deletesuccess'),
                    type: 'is-danger'
                });
                this.$emit('refresh');
            }
        }
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
                        <b-dropdown-item onClick={this.confirmDelete} class="has-text-danger">
                            {Translation.get('button.user.delete')}
                        </b-dropdown-item>
                    </b-dropdown>
                </td>
            </tr>
        )
    },

}

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